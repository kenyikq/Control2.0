import { Platform } from '@ionic/angular';


import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  PushNotificationActionPerformed,
  Token, 
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications'
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(public platform:Platform) { 
    this.inicializar();
  }
 
  
  inicializar(){
    if(this.platform.is('capacitor')){
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          // Permission granted, proceed to register for push notifications
          PushNotifications.register()
            .then(() => {
              this.addlistener();
              console.log('Successfully registered for push notifications.');
              // You can perform further actions here, like updating UI or sending the registration token to your server.
            })
            .catch(error => {
              console.error('Failed to register for push notifications:', error);
              // Handle the error, possibly by showing an error message to the user.
            });
        } else {
          // Permission denied, show an error message to the user
          console.log('Push notification permission denied.');
          // You can show a modal or display a message to the user explaining the importance of push notifications and how to enable them in settings.
        }
      });
      
    }
    else{
      
    }
  
  }
  // Request permission to use push notifications
  // iOS will prompt user and return if they granted permission or not
  // Android will just grant without prompting
  

  // On success, we should be able to receive notifications
  

  // Some issue with our setup and push will not work
  
addlistener(){// en primer plano
  LocalNotifications.schedule({
    notifications:[
      {
        title:'notificion local',
        body: 'notificacion.body',
        id:1,
      }
    ]
  });



  PushNotifications.addListener('pushNotificationReceived',
    (notification: PushNotificationSchema) => {
      alert('Push received: ' + JSON.stringify(notification));
     
    });

 

  
}
  
dejardeMoostrar(){ // Method called when tapping on a notification
  PushNotifications.addListener('pushNotificationActionPerformed',
    (notification: ActionPerformed) => {
      alert('Push action performed: ' + JSON.stringify(notification));
    }
  );

    

}
 

}
