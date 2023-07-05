import { Component, OnInit, NgModule, NO_ERRORS_SCHEMA  } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import {  Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';


import { Usuario } from '../models';
import { from } from 'rxjs';



@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  providers: [FormsModule]
})
export class RegistroComponent implements OnInit {
  usuario: Usuario = {
  uid: '',
  nombre: '',
  contacto: '',
  email: '',
  password: '',
  fecha:new Date(),
  };

  loading: any;
  uid = '';
  path= '/usuarios/';
  private miSuscripcion: Subscription;

  

observab:Subscription;
confirmarPass ='';

myForm: FormGroup;
isSubmitted = false;
valor=false;



  constructor(public firestoreService: FirestoreService,
              public toastCtrl: ToastController,
              private platform: Platform,
              public navCtrl: NavController,
              public alertController: AlertController,
              public loadingController: LoadingController,
              public formBuilder: FormBuilder,
              public log: FirebaseauthService,) {
                
                
         
                 this.getUserInfo();
                

                this.myForm = this.formBuilder.group({
                  nombre: ['', Validators.required],
                  email: ['', [Validators.required, Validators.email]],
                  password: ['',[Validators.required, Validators.minLength(6), Validators.pattern('^(?=.*[A-Z]).{6,}$')]],
                  celular:['',[Validators.required, Validators.pattern('[0-9]{3}[ -][0-9]{3}[ -][0-9]{4}')]],
                  confirmarpassword: ['',[Validators.required, Validators.minLength(6), Validators.pattern('^(?=.*[A-Z]).{6,}$')]],
                });

              }

        


 async ngOnInit() {
  

  }

  
  
 submitForm() {
    this.isSubmitted = true;
    if (!this.myForm .valid) {
      console.log('Please provide all the required values!')
      return false;
    } else {
      console.log(this.myForm .value);
      return true;
    }
  }

  restartApp() {
    this.platform.ready().then(() => {
      window.location.reload();
    });
  }
 

  limpiarcampos(){
    console.log('Limpiar campos');
    this.usuario= {
      uid: '',
      nombre: '',
      contacto: '',
      email: '',
      password: '',
      fecha:new Date(),
      };
  }

  async  guardarDatos(){

    this.usuario.uid=this.uid;
      console.log('estes es el uid: '+this.uid);
        this.usuario.uid=this.uid;
   
        const path = '/usuarios';
        console.log(path);
       this.firestoreService.createdoc(this.usuario, path, this.uid).then( ans =>{
          
        this.loading.dismiss().then( () => {
  
            this.presentToast('Registro exitoso');
            this.navCtrl.navigateRoot('/home');
          }).catch(() =>{console.log('error de id:');});
       });
  
      
  
     
  }

 async registro(){
 // this.log.getUid();
 
    const credenciales ={
      email: this.usuario.email,
      password: this.usuario.password,
    };
    

 const valor = await this.log.registrar(credenciales.email,credenciales.password,this.loading);

 this.showLoading();
 if(valor){
 this.uid= await this.log.getUid();
 this.guardarDatos();
 }

 else{
  this.loading.dismiss();
 }

 

  }


  async registrar(){


  if(this.myForm.valid)
    {

      
     this.registro().catch(err=>{
      this.loading.dismiss();
      this.alerta('Error al intentar regisrar');
  
  });
   }


else{ this.alerta('Validar que los campos esten debidamente llenos');}
this.touchedcontrols();
  }

 async salir(){
  
   await this.log.logout();  
    this.uid='';
    this.restartApp();
   
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
     message: msg,
     duration: 2000,
     position: 'bottom'
   });

  toast.present();
  }

  async presentLoading(){
    
  this.loading = await this.loadingController.create({
   cssClass: 'normal',
   message:'Guardando',
  });
  await this.loading.present();

  }

  async alerta(msgAlerta: string){
  const alert = await this.alertController.create({
    cssClass: 'normal',
    header: 'Alerta!',
    message:msgAlerta ,
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

  
 async getUserInfo(){

  this.log.stateauth();
   await this.log.stateauth().subscribe(res=>{
    
    if(res){
     this.log.getUid().then(res=>{
        if (res!==''){
          this.firestoreService.getDoc<Usuario>(this.path, this.log.Uid).subscribe(resp=>{
            if(resp){
              this.usuario=resp;
              this.uid=resp.uid;
             
            }
            else{console.log('No hay datos');}
           
          });
    
        }
    
        else{
          this.uid='';
          this.limpiarcampos();
        }
    
      });
    }

  });
  





    
  }

  

  goAnOtherPage() {
    this.navCtrl.navigateRoot('/home');

   // this.seleccionA();
  }
  async showLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'normal',
      message: 'Registrando...',
      //duration: 3000,
    });

    this.loading.present();
  }
 
  touchedcontrols(){
    Object.keys(this.myForm.controls).forEach(controlKey => {
      const control = this.myForm.get(controlKey);
      control?.markAsTouched();
    });
  }
  validarcel() {
    const regex = /^[0-9\-]*$/;
    const valor=regex.test(this.usuario.contacto);


return valor;
    
  }
 /* seleccionA(){

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

}
