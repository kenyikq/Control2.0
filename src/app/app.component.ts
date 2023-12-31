import { NotificationsService } from './services/notifications.service';
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
    public notification: NotificationsService,
    public firestoreService: FirestoreService,
    public log: FirebaseauthService,) {
      this.notification.inicializar();
      this.startTime = moment(); // Registra el tiempo de inicio
    this.updateConnectedTime(); // Actualiza el tiempo conectado

    this.platform.ready().then(() => {//verificar si la plataforma esta lista para luego verificar la conectividad
      this.checkNetworkStatus();
      this.notification.inicializar();
    });
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

    checkNetworkStatus() {
      
      if (navigator.onLine) {
        console.log('La aplicación está en línea');
      } else {
        console.log('No hay conexión a Internet');
      }
    }
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
