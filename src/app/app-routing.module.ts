import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MovimientosPage } from './pages/movimientos/movimientos.page';
import { DeudasPage } from './pages/deudas/deudas.page';
import { PresupuestoPage } from './pages/presupuesto/presupuesto.page';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DaschboardComponent } from './pages/daschboard/daschboard.component';

const routes: Routes = [
  {    path: 'home',  component: DaschboardComponent },  
  { path: 'movimientos', component: MovimientosPage },
  { path: 'deudas', component: DeudasPage },
  { path: 'presupuesto', component: PresupuestoPage },
  { path: 'login', component: LoginComponent },
  { path: 'usuario', component: RegistroComponent },
  {    path: '', component: DaschboardComponent },
  {    path: '**', redirectTo: 'home', pathMatch: 'full' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
