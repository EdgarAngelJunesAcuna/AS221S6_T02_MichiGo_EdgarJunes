import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import contractABI from 'src/app/abi/SavingsAccount.json';
declare let window: any;

@Component({
  selector: 'app-transaccion',
  templateUrl: './transaccion.component.html',
  styleUrls: ['./transaccion.component.css']
})
export class TransaccionComponent implements OnInit {
  web3: Web3;
  contract: any;
  contractAddress: string = '0x800902fFC83417fc9aAbA04133Fc1A9b2B1a3CCF'; // Reemplaza con la dirección de tu contrato desplegado

  recipientAddress: string = '';
  amount: string = '';
  isWalletConnected: boolean = false;
  accountAddress: string = '';
  balance: string = '0.00';
  currentNetwork: string = 'Desconocida';
  isNetworkModalVisible: boolean = false;
  isSwitching: boolean = false;
  selectedNetwork: any;

  // Agregar íconos de cada red en la carpeta 'assets'
  networks = [
    { chainId: '0x1', name: 'Ethereum', icon: 'assets/ethereum-icon.png' },
    { chainId: '0x5', name: 'Goerli', icon: 'assets/goerli-icon.png' },
    { chainId: '0xaa36a7', name: 'Sepolia', icon: 'assets/sepolia-icon.png' },
    { chainId: '0x4268', name: 'Ethereum holesky', icon: 'assets/holesky-icon.png' }
  ];

  constructor(private toastr: ToastrService) {
    // Inicializar Web3
    this.web3 = new Web3(window.ethereum);
  }

  ngOnInit(): void {
    try {
      // Verificar si Web3 y Ethereum están disponibles
      if (!window.ethereum) {
        console.error('MetaMask no está instalado o no se ha detectado.');
        return;
      }

      // Verificar si el ABI se ha importado correctamente
      if (!contractABI || !Array.isArray(contractABI)) {
        console.error('ABI no encontrado o no es válido. Asegúrate de que el archivo SavingsAccount.json se importe correctamente.');
        return;
      }

      // Verificar si la dirección del contrato es válida
      if (!this.contractAddress || !this.web3.utils.isAddress(this.contractAddress)) {
        console.error('Dirección del contrato no válida:', this.contractAddress);
        return;
      }

      // Inicializar el contrato
      this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);

      if (!this.contract || !this.contract.methods) {
        console.error('No se pudo inicializar el contrato correctamente');
      } else {
        console.log('Instancia del contrato creada correctamente:', this.contract);
      }
    } catch (error) {
      console.error('Error al inicializar el contrato:', error);
    }
  }

  async connectMetaMask() {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.accountAddress = accounts[0];
      this.isWalletConnected = true;
      await this.updateBalance();
      this.updateNetwork();
    } catch (error) {
      console.error('Error al conectar MetaMask:', error);
    }
  }

  async updateBalance() {
    try {
      const balanceInWei = await this.web3.eth.getBalance(this.accountAddress);
      this.balance = this.web3.utils.fromWei(balanceInWei, 'ether');
    } catch (error) {
      console.error('Error al obtener el saldo:', error);
    }
  }

  async updateNetwork() {
    try {
      const chainId = await this.web3.eth.getChainId();
      const network = this.networks.find(net => net.chainId === `0x${chainId.toString(16)}`);
      this.currentNetwork = network ? network.name : 'Desconocida';
    } catch (error) {
      console.error('Error al obtener la red:', error);
    }
  }

  toggleNetworkModal() {
    this.isNetworkModalVisible = !this.isNetworkModalVisible;
    this.isSwitching = false;
  }

  closeNetworkModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.toggleNetworkModal();
    }
  }

  async switchNetwork(network: any) {
    try {
      this.isSwitching = true;
      this.selectedNetwork = network;
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }]
      });
      this.updateNetwork();
      await this.updateBalance();
      this.isSwitching = false;
      this.isNetworkModalVisible = false;
    } catch (error) {
      console.error('Error al cambiar de red:', error);
      this.isSwitching = false;
    }
  }

  async sendTransaction() {
    if (!this.contract) {
      console.error('Contrato no inicializado correctamente');
      Swal.fire({
        title: 'Error',
        text: 'Error al inicializar el contrato',
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#d33',
      });
      return;
    }

    // Mostrar confirmación con SweetAlert antes de enviar la transacción
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas realizar esta transacción con el ahorro aplicado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      background: '#1a1a1a',
      color: '#fff',
    });

    if (result.isConfirmed) {
      try {
        // Mostrar notificación de que se está enviando la transacción
        const waitingAlert = Swal.fire({
          title: 'Enviando transacción',
          text: 'Por favor espera...',
          icon: 'info',
          background: '#1a1a1a',
          color: '#fff',
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const amountInWei = this.web3.utils.toWei(this.amount, 'ether');
        await this.web3.eth.sendTransaction({
          from: this.accountAddress,
          to: this.recipientAddress,
          value: amountInWei
        });

        // Cerrar alerta de espera
        Swal.close();

        // Notificar éxito
        Swal.fire({
          title: 'Éxito',
          text: 'Transacción enviada correctamente',
          icon: 'success',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#3085d6',
        });
        console.log('Transacción enviada correctamente');
      } catch (error) {
        console.error('Error al enviar la transacción:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al enviar la transacción',
          icon: 'error',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#d33',
        });
      }
    }
  }

  // Función para obtener el ícono de la red según su nombre
  getNetworkIcon(networkName: string): string {
    switch (networkName) {
      case 'Ethereum':
        return 'assets/ethereum-icon.png';
      case 'Goerli':
        return 'assets/goerli-icon.png';
      case 'Sepolia':
        return 'assets/sepolia-icon.png';
      case 'Holesky':
        return 'assets/holesky-icon.png';
      default:
        return 'assets/default-network.png'; // Ícono predeterminado
    }
  }
}
