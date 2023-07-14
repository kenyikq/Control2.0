
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PagesModule } from './pages/pages.module';
import { environment } from 'src/environments/environment';
import { FirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';//colacar para firebase
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';// importar para las validaciones

import { FirebaseauthService } from './services/firebaseauth.service';

@NgModule({
  declarations: [AppComponent,],
  imports: [BrowserModule, 
    IonicModule.forRoot(),
    PagesModule, //se importa
    FirestoreModule,
    
    AngularFireModule.initializeApp(environment.firebase),//colacar para firebase
    AngularFirestoreModule,
    AngularFireAuthModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule],
    
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, FirebaseauthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
