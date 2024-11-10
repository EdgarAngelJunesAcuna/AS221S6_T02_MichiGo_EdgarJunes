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
        text: 'Te recomendamos tener la aplicación MetaMask instalada.'
      });
    }
  }
}
