import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-custom-cursor',
  templateUrl: './custom-cursor.component.html',
  styleUrls: ['./custom-cursor.component.css']
})
export class CustomCursorComponent implements OnInit {
  private trailElements: HTMLDivElement[] = [];
  private maxTrail = 10;
  private showMessage = true; // Controla la visibilidad del mensaje
  private messageInterval: any;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    // Crear los elementos de trazo
    for (let i = 0; i < this.maxTrail; i++) {
      const trailElement = this.renderer.createElement('div');
      this.renderer.addClass(trailElement, 'cursor-trail');
      document.body.appendChild(trailElement);
      this.trailElements.push(trailElement);
    }

    // Configurar un temporizador para alternar la visibilidad del mensaje cada 5 segundos
    this.messageInterval = setInterval(() => {
      this.showMessage = !this.showMessage;
    }, 5000);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    // Mover el cursor personalizado
    const cursorElement = document.querySelector('.custom-cursor') as HTMLDivElement;
    const messageElement = document.querySelector('.cursor-message') as HTMLDivElement;
    
    if (cursorElement) {
      cursorElement.style.left = `${event.clientX}px`;
      cursorElement.style.top = `${event.clientY}px`;
    }

    // Mostrar u ocultar el mensaje basado en el valor de showMessage
    if (messageElement) {
      messageElement.style.left = `${event.clientX}px`;
      messageElement.style.top = `${event.clientY - 40}px`; // Posición encima del cursor
      messageElement.style.display = this.showMessage ? 'block' : 'none';
    }

    // Mover los elementos de trazo
    this.trailElements.forEach((trail, index) => {
      const delay = (index + 1) * 50;
      setTimeout(() => {
        trail.style.left = `${event.clientX}px`;
        trail.style.top = `${event.clientY}px`;
        trail.style.opacity = '1';
      }, delay);
      setTimeout(() => {
        trail.style.opacity = '0';
      }, delay + 100);
    });
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruya
    clearInterval(this.messageInterval);
  }
}
