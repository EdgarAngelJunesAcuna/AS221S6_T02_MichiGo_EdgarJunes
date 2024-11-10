import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isModalOpen = false; // Controla el estado del modal de login
  isWalletModalOpen = false; // Controla el estado del modal de la billetera
  email = ''; // Variable para almacenar el email ingresado
  selectedWallet: string = '';
  showingQR = false; // Controla si se debe mostrar el QR
  walletConnected = false; // Controla si la billetera está conectada

  // Lista de correos permitidos
  allowedEmails: string[] = [
    'edgar.junes@vallegrande.edu.pe',
    'brandon.guerrero@vallegrande.edu.pe',
    'anghela.rodriguez@vallegrande.edu.pe'
  ];

  // Links específicos para cada billetera
  walletLinks: { [key: string]: string } = {
    rainbow: 'https://rainbow.me',
    coinbase: 'https://chromewebstore.google.com/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
    walletconnect: 'https://explorer.walletconnect.com/?type=wallet',
    argent: 'https://www.argent.xyz/',
    ledger: 'https://www.ledger.com/',
    rabby: 'https://rabby.io/',
    trust: 'https://trustwallet.com/'
  };

  constructor(private router: Router) {} // Inyectar el Router en el constructor

  // Función para abrir el modal de login
  openModal() {
    this.isModalOpen = true;
  }

  // Función para cerrar el modal de login
  closeModal() {
    this.isModalOpen = false;
  }

  // Function to open the wallet modal and close the initial one
  openWalletModal() {
    this.isModalOpen = false;
    this.isWalletModalOpen = true;
  }

  // Function to close the wallet modal
  closeWalletModal() {
    this.isWalletModalOpen = false;
    this.showingQR = false;  // Reset the QR display state when the modal is closed
  }

  // Function to show QR code based on the selected wallet
  showQR(wallet: string) {
    this.selectedWallet = wallet;
    this.showingQR = true; // Display the specific QR or information for the selected wallet
  }

  // Función para manejar el envío del Magic Link
  sendMagicLink() {
    if (this.allowedEmails.includes(this.email.toLowerCase())) {
      // Mostrar el SweetAlert de éxito con color negro y un retardo de 2 segundos
      Swal.fire({
        icon: 'success',
        title: 'Solicitud en proceso',
        text: 'Estamos enviando el Magic Link a tu correo. Por favor, espera...',
        background: '#000',  // Fondo negro
        color: '#fff',       // Texto blanco
        timer: 2000,         // Esperar 2 segundos
        timerProgressBar: true,
        showConfirmButton: false // No mostrar botón "OK"
      }).then(() => {
        this.closeModal(); // Cerrar el modal

        // Redirigir a la ruta 'navegacion-barra'
        this.router.navigate(['/navegacion-barra']);
      });
    } else {
      // Mostrar el SweetAlert de error en caso de que el correo no esté autorizado
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Solo se permite el acceso a usuarios MichiGo.',
        background: '#000',  // Fondo negro
        color: '#fff',       // Texto blanco
        confirmButtonColor: '#d33'
      });
    }
  }

  // Método para abrir MetaMask y manejar la conexión
  async connectMetaMask() {
    if (typeof (window as any).ethereum !== 'undefined') {
      // MetaMask está instalada
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        this.walletConnected = true;

        // SweetAlert de éxito
        Swal.fire({
          icon: 'success',
          title: 'Conexión Exitosa',
          text: 'Tu cuenta de MetaMask ha sido conectada.',
          timer: 2000,
          showConfirmButton: false,
          background: '#000',
          color: '#fff'
        }).then(() => {
          this.router.navigate(['/navegacion-barra']);
        });
      } catch (error) {
        // Error al conectar MetaMask
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'Hubo un problema al conectar MetaMask.',
          background: '#000',
          color: '#fff',
          confirmButtonColor: '#d33'
        });
      }
    } else {
      // MetaMask no está instalada
      Swal.fire({
        icon: 'error',
        title: 'MetaMask No Encontrada',
        text: 'No tienes instalada la extensión de MetaMask.',
        background: '#000',
        color: '#fff',
        confirmButtonColor: '#d33',
        footer: '<a href="https://metamask.io/download.html" target="_blank" style="color: #00f">Instalar MetaMask</a>'
      });
    }
  }

  // Método para manejar el botón de MetaMask en tu HTML
  handleMetaMaskLogin() {
    this.selectedWallet = 'metamask';
    this.showingQR = false; // No mostrar QR, solo la conexión de MetaMask
    this.connectMetaMask(); // Aquí llamas la lógica para conectar MetaMask
  }
  
}
