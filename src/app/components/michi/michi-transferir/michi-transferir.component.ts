import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Web3 from 'web3';
import { NgIf, NgFor } from '@angular/common';
import Swal from 'sweetalert2';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Component({
  selector: 'app-michi-transferir',
  templateUrl: './michi-transferir.component.html',
  styleUrls: ['./michi-transferir.component.css'],
  standalone: true,
  imports: [NgIf, NgFor]
})
export class MichiTransferirComponent implements OnInit {
  account: string | undefined;
  balance: string | undefined;
  web3: Web3 | undefined;
  connectionMessage: string | undefined;
  lastClaimTime: number | undefined;
  senderAccount: string = '';
  recipientAccount: string = '';
  senderName: string = 'Remitente';
  recipientName: string = 'Destinatario';
  transferAmount: string = '0.01'; // Monto inicial por defecto
  isSenderHidden = true; // Inicia como oculto
  isRecipientHidden = true; // Inicia como oculto
  isModalOpen = false; // Controla la visibilidad del modal
  modalTitle: string = ''; // Título del modal
  modalContent: string = ''; // Contenido del modal

  private readonly REWARD_INTERVAL = 86400000; // 24 horas en milisegundos
  private readonly knownWallets: { [key: string]: string } = {
    '0x800902fFC83417fc9aAbA04133Fc1A9b2B1a3CCF': 'Remitente Conocido',
    '0x1d7043a2907574c5101134791596cBeCFe47D53A': 'Destinatario Conocido'
  };

  constructor(private cd: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask está instalado y listo.');
      this.web3 = new Web3(window.ethereum);
    } else {
      console.error('MetaMask no está instalado. Por favor, instala MetaMask para continuar.');
      this.showModal('Error de Conexión', 'MetaMask no está instalado. Por favor, instala MetaMask para continuar.');
    }
  }

  onSenderInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.senderAccount = inputElement.value;
    this.senderName = this.knownWallets[this.senderAccount.toLowerCase()] || this.senderAccount;
  }

  onRecipientInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.recipientAccount = inputElement.value;
    this.recipientName = this.knownWallets[this.recipientAccount.toLowerCase()] || this.recipientAccount;
  }

  onAmountInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.transferAmount = inputElement.value;
  }

  // Función para alternar visibilidad del remitente
  toggleSenderVisibility() {
    this.isSenderHidden = !this.isSenderHidden;
  }

  // Función para alternar visibilidad del destinatario
  toggleRecipientVisibility() {
    this.isRecipientHidden = !this.isRecipientHidden;
  }

  // Función para abrir el modal con la información correcta
  openModal(type: string) {
    if (type === 'sender') {
      this.modalTitle = 'Remitente';
      this.modalContent = this.senderAccount;
    } else if (type === 'recipient') {
      this.modalTitle = 'Destinatario';
      this.modalContent = this.recipientAccount;
    }
    this.isModalOpen = true;
  }

  // Función para cerrar el modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Función para mostrar un modal de error
  showModal(title: string, content: string) {
    this.modalTitle = title;
    this.modalContent = content;
    this.isModalOpen = true;
  }

  // Función para mostrar SweetAlert cuando la transacción es exitosa
  showSuccessAlert(title: string, content: string) {
    Swal.fire({
      title: title,
      text: content,
      icon: 'success',
      confirmButtonText: 'Cerrar',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  // Función para restablecer el formulario
  resetForm() {
    this.senderAccount = '';
    this.recipientAccount = '';
    this.transferAmount = '0.01'; // Valor inicial por defecto
  }

  async connectMetaMask() {
    if (!this.web3) {
      this.showModal('Error de Conexión', 'MetaMask no detectado. Por favor, instala MetaMask e intenta nuevamente.');
      return;
    }

    try {
      // Solicitar acceso a las cuentas de MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.account = accounts[0]?.toLowerCase();
      const senderAccountNormalized = this.senderAccount.toLowerCase();

      console.log(`Cuenta conectada: ${this.account}`);
      this.showModal('Conectado', `Cuenta conectada: ${this.account}`);

      // Verificar la red a la que está conectada MetaMask
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x4268') { // '0x4268' es el hexadecimal para Holesky
        this.showModal('Error de Red', 'Por favor, conecta MetaMask a la red Holesky.');
        return;
      }

      if (this.account !== senderAccountNormalized) {
        this.showModal('Error de Cuenta', 'Cuenta incorrecta. Debes conectarte con la cuenta de envío específica.');
        return;
      }

      const now = Date.now();
      if (this.lastClaimTime && (now - this.lastClaimTime) < this.REWARD_INTERVAL) {
        this.showModal('Error', 'Ya has enviado una recompensa. Inténtalo de nuevo en 24 horas.');
        return;
      }

      if (this.account) {
        // Obtener saldo de la cuenta
        const balance = await this.web3.eth.getBalance(this.account);
        this.balance = this.web3.utils.fromWei(balance, 'ether');
      }

      if (parseFloat(this.balance || '0') < parseFloat(this.transferAmount)) {
        this.showModal('Error de Saldo', 'Saldo insuficiente para completar la transacción.');
        return;
      }

      // Enviar la transacción
      const tx = await this.web3.eth.sendTransaction({
        from: this.senderAccount,
        to: this.recipientAccount,
        value: this.web3.utils.toWei(this.transferAmount, 'ether')
      });

      console.log('Hash de la transacción:', tx.transactionHash);

      // Mostrar SweetAlert cuando la transacción es exitosa
      this.showSuccessAlert('Transacción Exitosa', `¡Éxito! Se ha enviado ${this.transferAmount} ETH a ${this.recipientName}.`);

      this.lastClaimTime = now;
      this.resetForm();

    } catch (error: any) {
      if (error.code === 4001) {
        this.showModal('Transacción Rechazada', 'Conexión rechazada por el usuario.');
      } else {
        this.showModal('Error', 'Error al conectar MetaMask o enviar la transacción.');
      }
    }
  }
}
