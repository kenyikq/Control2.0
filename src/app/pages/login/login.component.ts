import { Component, OnInit } from '@angular/core';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { Usuario } from '../models';




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {


    loading: any;
    path= '/usuarios';
    uid = '';
    usuario: Usuario  = {
      uid: '',
      nombre: '',
      contacto: '',
      email: '',
      password: '',
      fecha:new Date(),
      };

  constructor(public log: FirebaseauthService,
    public firestoreService: FirestoreService,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public loadingController: LoadingController,
    public alertController: AlertController) {
     this.log.stateauth().subscribe( res=>{
       
        if (res !== null){
          this.uid= res.uid;
          this.getUserInfo(this.uid);
          console.log(res);
        }else {
          this.uid='';
          this.limpiarcampos();
        }
      });
    }
   
  


async ngOnInit() {
const uid = await this.log.getUid();
this.limpiarcampos();
//this.seleccionA();
}


/*seleccionA(){

  this.inactive('1');
  this.inactive('pri');
  this.inactive('3');
  this.inactive('4');
  this.inactive('2');
}
//para marcar como seleccionado la opcion dentro del menu


active(id: string){
  const active = document.getElementById(id);
  active.classList.add('active');
}

inactive(id: string){
  const active = document.getElementById(id);

  active.classList.remove('active');
}*/

limpiarcampos(){
this.usuario= {
uid: '',
nombre: '',
contacto: '',
email: '',
password: '',
fecha:new Date(),
};
}
async alerta(msgAlerta: string){
  const alert = await this.alertController.create({
    cssClass: 'normal',
    header: 'Alerta!',
    message: '<strong>'+msgAlerta +'</strong>',
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
}




async presentLoading(){
this.loading = await this.loadingController.create({
cssClass: 'normal',
message:'Ingresando',
});
await this.loading.present();

}

getUserInfo(uid: string){
const path ='usuario';
this.firestoreService.getDoc<any>(path,uid).subscribe(res=>{
  this.usuario = res;
  console.log('Esto es del usuario '+uid);
});
}

async ingresar(){

   this.login();



}

login(){
  const credenciales ={
    email: this.usuario.email,
    password: this.usuario.password,
    };
    this.log.login(credenciales.email, credenciales.password).then(res =>{
      if(res){
        this.presentLoading().then(respuesta =>{
          this.loading.dismiss();
          this.goAnOtherPage('/home');

        });
  this.presentToast('Ingreso Exitoso');
      }

    }).catch(err =>{
      alert('Error al ingresar, Verifique sus datos');
    });


}

async presentToast(msg: string) {
  const toast = await this.toastCtrl.create({
   message: msg,
   duration: 2000,
   position: 'bottom'
 });

toast.present();
}

  goAnOtherPage(ruta: string) {
    this.navCtrl.navigateRoot(ruta);
  }
}
