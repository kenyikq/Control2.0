import { CUSTOM_ELEMENTS_SCHEMA, NgModule,NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeudasPage } from './deudas/deudas.page';
import { PresupuestoPage } from './presupuesto/presupuesto.page';
import { MovimientosPage } from './movimientos/movimientos.page';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { RegistroComponent } from './registro/registro.component';
import { LoginComponent } from './login/login.component';
import { DaschboardComponent } from './daschboard/daschboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FechaLargaPipe } from '../fechaLarga.pipe';

@NgModule({
  declarations: [FechaLargaPipe, DeudasPage, PresupuestoPage, MovimientosPage, DaschboardComponent, LoginComponent , RegistroComponent],
  imports: [
    CommonModule,
    IonicModule, //importar
    FormsModule ,//importar
    RouterModule,
    NgApexchartsModule,
    BrowserModule, RouterModule, ReactiveFormsModule,
  ],
  schemas: [ NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA ], 
 
})
export class PagesModule { }
