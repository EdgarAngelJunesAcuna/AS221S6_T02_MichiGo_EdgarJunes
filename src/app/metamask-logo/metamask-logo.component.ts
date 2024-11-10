import { Component, OnInit, ElementRef } from '@angular/core';
const MetaMaskLogo = require('@metamask/logo');

@Component({
  selector: 'app-metamask-logo',
  templateUrl: './metamask-logo.component.html',
  styleUrls: ['./metamask-logo.component.css']
})
export class MetamaskLogoComponent implements OnInit {
  
  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    // Crear el viewer de MetaMask con las dimensiones y configuración deseadas
    const viewer = MetaMaskLogo({
      pxNotRatio: true,
      width: 500,
      height: 400,
      followMouse: true,
      slowDrift: false
    });

    // Agregar el viewer al DOM
    const container = this.elRef.nativeElement.querySelector('#logo-container');
    container.appendChild(viewer.container);

    // Hacer que el logo siga el mouse
    viewer.setFollowMouse(true);
  }
}
