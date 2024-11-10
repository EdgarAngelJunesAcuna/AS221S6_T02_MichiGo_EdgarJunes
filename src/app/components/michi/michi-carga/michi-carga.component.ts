import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-michi-carga',
  templateUrl: './michi-carga.component.html',
  styleUrls: ['./michi-carga.component.css']
})
export class MichiCargaComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Leer el parámetro "option" desde la URL
    const option = this.route.snapshot.paramMap.get('option');

    // Simular el tiempo de carga de la animación (por ejemplo, 5 segundos)
    setTimeout(() => {
      if (option === 'MICHITRANSFERIR') {
        this.router.navigate(['/transferir-michi']);
      } else if (option === 'MICHIINFO') {
        this.router.navigate(['/info-michi']);
      }
    }, 5000); // 5000 milisegundos = 5 segundos
  }
}
