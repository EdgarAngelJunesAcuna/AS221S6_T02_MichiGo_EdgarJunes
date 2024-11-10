import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carga',
  templateUrl: './carga.component.html',
  styleUrls: ['./carga.component.css']
})
export class CargaComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simula el tiempo de carga de la animación (por ejemplo, 5 segundos)
    setTimeout(() => {
      this.router.navigate(['/landing-page']); // Cambia a tu página de destino
    }, 5000); // 5000 milisegundos = 5 segundos
  }
}
