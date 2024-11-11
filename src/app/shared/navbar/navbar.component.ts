import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showProfileMenu: boolean = false;
  account: string | null = 'DevelopMichiGo';

  constructor(private router: Router) {}

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  onDisconnect() {
    // Lógica para "desconectar" MetaMask en la aplicación
    this.account = null; // Limpia la cuenta de la sesión de tu aplicación

    // Mostrar mensaje de desconexión con SweetAlert
    Swal.fire({
      icon: 'info',
      title: 'Sesión Cerrada',
      text: 'Has cerrado la sesión de MetaMask.',
      background: '#000',
      color: '#fff',
      confirmButtonColor: '#3085d6'
    }).then(() => {
      // Redirige a la página de login después de cerrar la sesión
      this.router.navigate(['/login']);
    });
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
