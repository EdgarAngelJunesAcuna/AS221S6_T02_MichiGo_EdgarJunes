import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importa el Router

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showProfileMenu: boolean = false;
  account: string = 'DevelopMichiGo'; // Este valor puede venir de un servicio o input property.

  // Inyecta el Router en el constructor
  constructor(private router: Router) {}

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  onDisconnect() {
    // Lógica para desconectar al usuario (si hay alguna)
    console.log('Usuario desconectado');
    
    // Redirige a la página de login
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
