import { FirestoreService } from './services/firestore.service';
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseauthService } from './services/firebaseauth.service';
import { Usuario } from './pages/models';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  startTime: moment.Moment;
  connectedTime: string;
  
  constructor(public platform: Platform,
    public firestoreService: FirestoreService,
    public log: FirebaseauthService,) {
      this.startTime = moment(); // Registra el tiempo de inicio
    this.updateConnectedTime(); // Actualiza el tiempo conectado

    // Actualiza el tiempo conectado cada segundo
    setInterval(() => {
      this.updateConnectedTime();
    }, 1000);
  setTimeout(() => {
    this.getUserInfo();
  }, 100);
  }

  usuario: Usuario  = {
    uid: '',
    nombre: '',
    contacto: '',
    email: '',
    password: '',
    fecha:new Date(),
    };

  async getUserInfo(){

    this.log.stateauth();
     await this.log.stateauth().subscribe(res=>{
      
      if(res){
       this.log.getUid().then(res=>{
          if (res!==''){
            this.firestoreService.getDoc<Usuario>('/usuarios/', this.log.Uid).subscribe(resp=>{
              if(resp){
                this.usuario=resp;
               
              }
              else{console.log('No hay datos');}
             
            });
      
          }
      
        
      
        });
      }
  
    });
  
      
    }

    updateConnectedTime() {
      const currentTime = moment();
      const duration = moment.duration(currentTime.diff(this.startTime));
      this.connectedTime = `${Math.floor(duration.asHours())}:${duration.minutes()}:${duration.seconds()}`;
    }
    


}
