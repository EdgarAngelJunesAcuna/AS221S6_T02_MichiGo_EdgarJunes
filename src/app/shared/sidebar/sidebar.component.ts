import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  showTransaccionesContent: boolean = false;
  showInformesContent: boolean = false;

  toggleTransacciones() {
    this.showTransaccionesContent = !this.showTransaccionesContent;
  }

  toggleInformes() {
    this.showInformesContent = !this.showInformesContent;
  }
}
