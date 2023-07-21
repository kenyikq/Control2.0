import { Subscription } from 'rxjs';

import { Component, OnInit, ViewChild  } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonSelect, LoadingController, ModalController, NavController, ToastController, IonSegment, IonCheckbox } from '@ionic/angular';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Registro, Tarea } from '../models';
import * as moment from 'moment';
import { set } from 'date-fns';




@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.page.html',
  styleUrls: ['./presupuesto.page.scss'],
})
export class PresupuestoPage implements OnInit {
 
  @ViewChild('selectcategoria') selectcategoria: IonSelect;
  @ViewChild('selectsubcategoria') selectsubcategoria: IonSelect;
  @ViewChild('modal') modal: any;
  @ViewChild('modal2') modal2: any;
  @ViewChild('check1') check1: IonCheckbox;
  @ViewChild('check2') check2: IonCheckbox;
  
  todoList: Tarea[]=[];
  datos: Tarea[]=[];
  valorcheck1 = false;
  valorcheck2 = false;
  isActionSheetOpen= false
  segmentoSeleccion="Pendiente";
  tituloAgregarTarea="Nueva Tarea"
  presentingElement: any = null;
  date = moment(new Date()).format('YYYY-MM-DD');
  newtarea: Tarea= {
    id: this.firestoreService.getid(),
    descripcion: '',
    categoria: '',
    subcategoria: '',
    monto: 0,
    fecha: moment(new Date()).format('YYYY-MM-DD'),
    quincena:'',
    status: 'Pendiente'

  };
  
  private myForm: FormGroup;
  encabezado="Presupuesto";
  loading: any;
  uid='';
private path= 'usuarios/'+this.uid+'/presupuesto/';
  constructor(public firestoreService: FirestoreService,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public formBuilder: FormBuilder,
    public log: FirebaseauthService,) {
     
   this.idusuario();

  }

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    this.myForm = this.formBuilder.group({
      descripcion: ['', Validators.required],
      quincena: ['', Validators.required],
      subcategoria: ['', Validators.required],
      categoria: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(1)]],
    });
    this.limpiar();
  }
  completar(tarea:Tarea){
    
    let statuschange =''; 
    let msj='';
    if(tarea.status==='Completado'){
      statuschange= 'Pendiente';
      msj='Tarea Deshecha';
      this.firestoreService.updateStatus(statuschange,tarea.id,this.path).then(res=>{
        this.presentToast(msj);
      })
    }
    else{
      statuschange= 'Completado';
      msj='Tarea Completada';
      this.firestoreService.updateStatus(statuschange,tarea.id,this.path).then(res=>{
        this.presentToast(msj);
        this.guardarGasto(tarea);
      })
    }
    
   

  }

  prueba(){
    console.log('prueba');
  }
 
  edit(tarea:Tarea) { 
   
    console.log(tarea.fecha);
    this.date=tarea.fecha;
    this.tituloAgregarTarea="Actualizar Tarea";
    this.newtarea= tarea;
   
    setTimeout(() => {
      this.selectcategoria.value=tarea.categoria;
      this.selectsubcategoria.value=tarea.subcategoria;
    }, 1000);
   
  }
  changeSegment(ev: any) {
    
    this.segmentoSeleccion = ev.detail.value;
    
    this.filtroStatus();
       
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



public actionSheetButtons = [
  {
    text: 'Primera quincena',
    role: 'destructive',
    data: {
      action: '1quincena',
    },
    handler: () => {
      this.encabezado='Presupuesto de la Primera Quincena';
    },
  },
  {
    text: 'Segunda Quincena',
    data: {
      action: 'Segunda',
    },
    handler: () => {
      this.encabezado='Presupuesto de la Segunda Quincena';
    },
  },
  {
    text: 'Cancel',
    role: 'cancel',
    data: {
      action: 'cancel',
    },
   
  },
];

fechaa() {
  
  this.newtarea.fecha= this.date
  const dia = moment(this.newtarea.fecha).format('D');
  const mes = moment(this.newtarea.fecha).locale('es').format('MMMM');  
 const anio = moment(this.newtarea.fecha).format('yyyy');

  
}
agregarTarea(){
  console.log(this.path);
 if (this.myForm.valid){
  this.firestoreService.createdoc(this.newtarea,this.path,this.newtarea.id).then(res=>{
this.limpiar();

  this.tituloAgregarTarea="Nueva Tarea"
this.modal.dismiss();

this.presentToast('Accion realizada correctamente');
  });

 }

 else{
  this.alerta("Debe llenar todos los campos");
 console.log(this.myForm.errors)
 }

}

cargartodoList(){
 this.firestoreService.getcollection<Tarea>(this.path).subscribe(res=>{
this.todoList = res;
this.datos= res;
this.filtroStatus();
});


}

filtroStatus(status: string= this.segmentoSeleccion){

  if  (status==="Todos"){
    this.todoList=this.datos;
    
  }
  else{
    
     this.todoList = this.datos.filter((tarea) => {
     return tarea.status == status;
    });
    

  }

}

limpiar(){
  this.newtarea= {
    id: this.firestoreService.getid(),
    descripcion: '',
    categoria: '',
    subcategoria: '',
    monto: 0,
    fecha: moment(new Date()).format('YYYY-MM-DD'),
    quincena:'',
    status: 'Pendiente'

  };
 }
 async idusuario(){ 
  
  let valor= true;
  await this.log.stateauth().subscribe(res=>{
    

    if (res !== null){
      
      this.uid= res.uid;
      
      this.path='usuarios/'+this.uid+'/presupuesto';

  
     this.fechaa();
     valor = true;
  
   setTimeout(() => {
    this.determinarquicena();
    this.filtroStatus();
   }, 200);
   
    
  }
  else{this.alertaLogin();
  valor = false;}
  });
  
  return valor;
  }
  async alertaLogin() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: '¡Debes iniciar sesion para usar este modulo!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Has cancelado la acción');
          },
        },
        {
          text: 'Ingresar',
          handler: () => {
            this.navCtrl.navigateRoot('/login');;
          },
        },
      ],
    });

    await alert.present();
  }

  async eliminar(tarea:Tarea) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      subHeader: 'Confirmacion',
      message: 'Seguro que desea eliminar esta tarea?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => {

        },
      },
      {
        text: 'Aceptar',
        role: 'confirm',
        handler: () => {
          this.firestoreService.deletedoc(tarea.id,this.path);
    this.presentToast('Tarea eliminada correctamente.');

        },
      },
      ],
    });

    await alert.present();
  }

   async onChange(ev: any) {
    if(ev!== null && ev.detail.checked===true){
      
      this.check1.checked= false;
     
    }

    else{
    
    setTimeout(() => {
      this.valorcheck1=true;
      this.valorcheck2=false;
    }, 10);
    
  }
      
      

      this.firestoreService.getCollectionquery<Tarea>(this.path,'quincena','==','Primera').subscribe( res=>{
        this.datos=res;
        this.todoList=res;
        this.encabezado='Presupuesto Para Primera Quincena';
        this.filtroStatus();
      });
    
    
    this.modal2.dismiss();
  }

   async onChange2(ev: any) {
    
    if(ev!== null && ev.detail.checked===true){
      
      this.check2.checked= false;
     
    }

    else{
      setTimeout(() => {
    
        this.valorcheck2=true;
          this.valorcheck1=false;
          this.encabezado='Presupuesto Para Segunda Quincena';
       }, 10);

    }
   
    
      
      this.firestoreService.getCollectionquery<Tarea>(this.path,'quincena','==','Segunda').subscribe( res=>{
        this.encabezado='Presupuesto Para Segunda Quincena';
        this.datos=res;
        this.todoList=res;
        this.filtroStatus();
      });
    

   
    this.modal2.dismiss();
  }
  determinarquicena(){
    const fechaActual = new Date();
    const diaActual = fechaActual.getDate();

    if (diaActual >= 13 && diaActual <= 25) {
      
      this.onChange(null);
      
      
    } else {
     
      this.onChange2(null);
    }
  
  }
  onWillDismiss(ev: any){
    console.log(ev);

  }

async  guardarGasto(tarea: Tarea){
    const path='usuarios/'+this.uid+'/movimientos';
    const newRegistro: Registro = await {
       id: this.firestoreService.getid(),
       fecha:moment(new Date()).locale('es').format('YYYY-MM-D') ,
       fechaCreacion: new Date(),
       categoria: 'Gastos',
       subcategoria: tarea.subcategoria,
       concepto: 'Pago de '+tarea.descripcion,
       monto: tarea.monto,
       mes: moment(new Date()).locale('es').format('MMMM'),
       dia: new Date().getDay().toString(),
       anio: moment().format('yyyy'),
   
     }
    

     this.firestoreService.createdoc(newRegistro, path, newRegistro.id);
     
   }
     
 

}
