import { Injectable } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/compat/auth';
import { AlertController, LoadingController } from '@ionic/angular';
import { getAuth, onAuthStateChanged } from "firebase/auth";


@Injectable({
  providedIn: 'root'
})
export class FirebaseauthService {
  
Uid='';

  constructor(private auth: AngularFireAuth,
  public alertController: AlertController,) { }

  login(email:string, password: string){
   return this.auth.signInWithEmailAndPassword(email,password);
  }

  logout(){
    return this.auth.signOut();
   }
 
 async  registrar(email: string ,password: string, loading: LoadingController){
 let valor=true;
   await  this.auth.createUserWithEmailAndPassword(email, password).then(res=>{
          valor= true;
    }).catch(error => {
      valor=false;

      this.alerta( error);

      loading.dismiss();
      
      
     
    });
    
    return valor;
   }
 
  



   async getUid(){
    const auth = getAuth();
await onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    this.Uid= user.uid;
   // console.log(' hay usuario logueado: '+this.Uid);
    
       // ...
  } else {
    // User is signed out
    // ...
   
    this.Uid=''
    
  }
});

return this.Uid;
    
   }
 
   stateauth(){
    
     return this.auth.authState;
   }
 
   async alerta(msgAlerta: string){
     const alert = await this.alertController.create({
       cssClass: 'normal',
       header: 'Alerta!',
       message: msgAlerta,
       buttons: [
         {
           text: 'Ok',
           role: 'Pk',
           cssClass: 'secondary',
           handler: (blah) => {
 
           }
         }
       ]
     });
 
     await alert.present();
   }

  
}
