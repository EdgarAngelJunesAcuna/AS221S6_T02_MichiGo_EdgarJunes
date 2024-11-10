import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // Asegúrate de importar HttpClientModule
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CargaComponent } from './components/carga/carga.component';
import { LoginComponent } from './auth/login/login.component';
import { LandingPageComponent } from './public/landing-page/landing-page.component';
import { MichigoComponent } from './admin/panel/michigo/michigo.component';
import { RedTestComponent } from './components/red-test/red-test.component';
import { MichiCargaComponent } from './components/michi/michi-carga/michi-carga.component';
import { MichiTransferirComponent } from './components/michi/michi-transferir/michi-transferir.component';
import { MichiInfoComponent } from './components/michi/michi-info/michi-info.component';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { BarraNavegacionComponent } from './admin/barra-navegacion/barra-navegacion.component';
import { MetamaskLogoComponent } from './metamask-logo/metamask-logo.component';
import { TransaccionComponent } from './admin/admin-transaccion/transaccion/transaccion.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Importar BrowserAnimationsModule
import { ToastrModule } from 'ngx-toastr'; // Importar ToastrModule

// Factory para cargar archivos de traducción
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CargaComponent,
    LoginComponent,
    LandingPageComponent,
    MichigoComponent,
    RedTestComponent,
    MichiCargaComponent,
    MichiInfoComponent,
    SidebarComponent,
    NavbarComponent,
    BarraNavegacionComponent,
    MetamaskLogoComponent,
    TransaccionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // Importa HttpClientModule
    FormsModule, 
    BrowserAnimationsModule, // Agregar este módulo aquí
    ToastrModule.forRoot({
      timeOut: 3000, // Duración del mensaje en milisegundos
      positionClass: 'toast-top-right', // Posición del toast
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
