import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Component({
  selector: 'app-michigo',
  templateUrl: './michigo.component.html',
  styleUrls: ['./michigo.component.css']
})
export class MichigoComponent {

  constructor(private router: Router) {}

  // Verificar si MetaMask está instalado y conectar
  async checkMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Pedir acceso a MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Mostrar mensaje de redireccionamiento
        Swal.fire({
          icon: 'success',
          title: 'Conectado',
          text: 'Redirigiendo a la página de selección de red...',
          timer: 3000, // 3 segundos antes de redirigir
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          // Redirigir a la página de red-test después de la conexión
          this.router.navigate(['/red-test']);
        });

      } catch (error) {
        console.error('Error al conectar MetaMask', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo conectar con MetaMask'
        });
      }
    } else {
      // Si MetaMask no está disponible
      Swal.fire({
        icon: 'warning',
        title: 'MichiGo - MetaMask',
        html: `
          <p>Te recomendamos tener la aplicación MetaMask instalada para utilizar esta función.</p>
          <a href="https://metamask.io/download.html" target="_blank">
            <button class="swal2-confirm swal2-styled" style="background-color: #3498db; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px;">
              Instalar MetaMask
            </button>
          </a>
        `,
        showConfirmButton: false
      });
    }
  }

  // Método para navegar a la página de inicio
  navigateToHome() {
    this.router.navigate(['/landing-page']); // Reemplaza '/' con la ruta de tu página principal si es diferente
  }
}
