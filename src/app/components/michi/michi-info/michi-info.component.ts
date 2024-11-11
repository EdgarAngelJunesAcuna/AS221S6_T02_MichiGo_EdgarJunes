import { Component } from '@angular/core';
import Web3 from 'web3';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-michi-info',
  templateUrl: './michi-info.component.html',
  styleUrls: ['./michi-info.component.css']
})
export class MichiInfoComponent {
  walletAddress: string | null = null;
  walletBalance: string | null = null;

  constructor(private router: Router) {}

  async connectWallet() {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        this.walletAddress = accounts[0];
        this.getWalletBalance();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al conectar MetaMask. Intenta de nuevo.'
        });
      }
    } else {
      this.showInstallMetaMaskAlert();
    }
  }

  // Mostrar alerta para instalar MetaMask
  private showInstallMetaMaskAlert() {
    Swal.fire({
      icon: 'warning',
      title: 'MetaMask no encontrado',
      html: `
        <p>Te recomendamos tener la aplicación MetaMask instalada para usar esta función.</p>
        <a href="https://metamask.io/download.html" target="_blank">
          <button class="swal2-confirm swal2-styled" style="background-color: #3498db; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px;">
            Instalar MetaMask
          </button>
        </a>
      `,
      showConfirmButton: false
    });
  }

  async getWalletBalance() {
    if (this.walletAddress) {
      const web3 = new Web3((window as any).ethereum);
      const balance = await web3.eth.getBalance(this.walletAddress);
      this.walletBalance = web3.utils.fromWei(balance, 'ether');
    }
  }

  navigateToTestNet() {
    this.router.navigate(['/red-test']);
  }

  clearWalletData() {
    this.walletAddress = null;
    this.walletBalance = null;
    Swal.fire({
      icon: 'info',
      title: 'Datos Limpiados',
      text: 'La información de la wallet ha sido borrada.'
    });
  }
}
