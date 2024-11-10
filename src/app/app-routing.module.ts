import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CargaComponent } from './components/carga/carga.component';
import { LandingPageComponent } from './public/landing-page/landing-page.component';
import { MichigoComponent } from './admin/panel/michigo/michigo.component';
import { RedTestComponent } from './components/red-test/red-test.component';
import { MichiCargaComponent } from './components/michi/michi-carga/michi-carga.component';
import { MichiTransferirComponent } from './components/michi/michi-transferir/michi-transferir.component';
import { MichiInfoComponent } from './components/michi/michi-info/michi-info.component';
import { LoginComponent } from './auth/login/login.component';
import { BarraNavegacionComponent } from './admin/barra-navegacion/barra-navegacion.component'; // Asegúrate de tener esto importado
import { TransaccionComponent } from './admin/admin-transaccion/transaccion/transaccion.component';

const routes: Routes = [
  { path: '', component: CargaComponent }, 

  { path: 'login', component: LoginComponent }, 

  { path: 'landing-page', component: LandingPageComponent },

  { path: 'navegacion-barra', component: BarraNavegacionComponent },
  { path: 'transacciones', component: TransaccionComponent },
  { path: 'usuario', component: TransaccionComponent },


  { path: 'michigo', component: MichigoComponent },
  { path: 'red-test', component: RedTestComponent },
  { path: 'michi-carga', component: MichiCargaComponent },
  { path: 'transferir-michi', component: MichiTransferirComponent },
  { path: 'info-michi', component: MichiInfoComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
