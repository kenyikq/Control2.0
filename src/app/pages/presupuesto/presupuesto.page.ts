
import { Component, OnInit, ViewChild  } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonSelect, LoadingController, ModalController, NavController, ToastController, IonSegment } from '@ionic/angular';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Tarea } from '../models';
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
  @ViewChild('segment') segment: IonSegment;
  todoList: Tarea[]=[];
  datos: Tarea[]=[];
  canDismiss = true;
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
      subcategoria: ['', Validators.required],
      categoria: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(1)]],
    });
    this.limpiar();
  }
  completar(tarea:Tarea){
    let statuschange ='';
    if(tarea.status==='Completado'){
      statuschange= 'Pendiente'
    }
    else{
      statuschange= 'Completado'
    }
    
    this.firestoreService.updateStatus(statuschange,tarea.id,this.path).then(res=>{
      this.presentToast('Tarea Completada');
    })

  }
 
  editar(tarea:Tarea) { 
    console.log(tarea);
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
   this.cargartodoList();
   setTimeout(() => {
    this.filtroStatus();
   }, 100);
   
    
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

}
