import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-barra-navegacion',
  templateUrl: './barra-navegacion.component.html',
  styleUrls: ['./barra-navegacion.component.css']
})
export class BarraNavegacionComponent {
  
  // Método para mostrar el alert
  showAlert() {
    Swal.fire({
      title: '¡Hola!',
      text: '¡Bienvenido a MichiTransferencia!',
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }
}
