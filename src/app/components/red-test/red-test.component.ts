import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'; // Importa SweetAlert2

@Component({
  selector: 'app-red-test',
  templateUrl: './red-test.component.html',
  styleUrls: ['./red-test.component.css']
})
export class RedTestComponent {
  isModalOpen = false; // Controla el estado del modal de red
  isOptionsModalOpen = false; // Controla el estado del modal de opciones
  selectedOption: string = ''; // Almacena la opción seleccionada

  constructor(private router: Router) {}

  // Abre el modal de opciones
  openOptionsModal() {
    this.isOptionsModalOpen = true;
  }

  // Cierra el modal de opciones
  closeOptionsModal() {
    this.isOptionsModalOpen = false;
  }

  // Abre el modal de selección de red
  openModal() {
    this.isModalOpen = true;
  }

  // Cierra el modal de selección de red
  closeModal() {
    this.isModalOpen = false;
  }

  // Acción cuando se selecciona una opción
  selectOption(option: string) {
    this.selectedOption = option;
    this.closeOptionsModal(); // Cierra el modal de opciones

    // Abre el modal para seleccionar la red
    this.openModal();
  }

  // Selecciona la red y cambia MetaMask a esa red
  async selectNetwork(network: string) {
    try {
      const result = await Swal.fire({
        title: 'Confirmar cambio de red',
        text: `¿Estás seguro de que deseas cambiar a la red ${network}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        if (network === 'Holesky') {
          await this.switchNetwork('0x4268');
        } else if (network === 'Sepolia') {
          await this.switchNetwork('0xaa36a7');
        } else if (network === 'Base Sepolia') {
          await this.switchNetwork('0x84532');
        }

        Swal.fire({
          title: '¡Red cambiada!',
          text: `Ahora estás en la red ${network}.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });

        // Redirigir primero a /michi-carga con la opción seleccionada como parámetro
        this.router.navigate(['/michi-carga', { option: this.selectedOption }]);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cambiar de red. Intenta nuevamente.',
        icon: 'error'
      });
    } finally {
      this.closeModal();
    }
  }

  // Función para cambiar la red de MetaMask
  async switchNetwork(chainId: string) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
    } catch (error) {
      console.error('Error al cambiar de red:', error);
    }
  }
}
