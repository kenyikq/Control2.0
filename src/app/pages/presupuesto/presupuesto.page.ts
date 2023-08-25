import { FechaLargaPipe } from './../../fechaLarga.pipe';
import { Subscription } from 'rxjs';
import { first, take, throwIfEmpty } from 'rxjs/operators';
import { Component, OnInit, ViewChild  } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonSelect, LoadingController, ModalController, NavController, ToastController, IonSegment, IonCheckbox, CheckboxCustomEvent } from '@ionic/angular';
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
  isActionSheetOpen= false;
  mesQuincena='';
  totalPresupuesto=0;
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
    
   
    let msj='';
    if(tarea.status==='Completado'){
      tarea.status= 'Pendiente';
      msj='Tarea Deshecha';
      this.firestoreService.updateStatus(tarea.status,tarea.id,this.path).then(res=>{
        this.presentToast(msj);
      })
    }
    else{
      tarea.status= 'Completado';
      msj='Tarea Completada';
      this.firestoreService.updateStatus(tarea.status,tarea.id,this.path).then(res=>{
        this.presentToast(msj);
        this.guardarGasto(tarea);
      })
    }
    
   

  }

  prueba(){
    console.log('prueba');
  }
 
  edit(tarea:Tarea) { 
   
   
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
 
  
 if (this.myForm.valid){
  this.firestoreService.createdoc(this.newtarea,this.path,this.newtarea.id).then(res=>{
this.limpiar();

  
this.modal.dismiss();

this.presentToast('Accion realizada correctamente');
this.tituloAgregarTarea="Nueva Tarea"
  });

 }

 else{
  this.alerta("Debe llenar todos los campos");
 console.log(this.myForm.errors)
 }

}



filtroStatus(seleccion: string= this.segmentoSeleccion){

  if  (this.segmentoSeleccion==="Todos"){
    this.todoList=this.datos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    console.log('todos');
    this.totalP();
  }
  else{
    
     let datos= this.datos.filter((tarea) => {
     return tarea.status == this.segmentoSeleccion;
    });

    this.todoList = datos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    this.totalP();

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
  

  capitalizar(str: string): string {
    if (str.length === 0) {
      return str;
    }
  
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }




   async onChange(ev: any) {
    
     if(ev!== null && ev.detail.checked===true){ //cuando doy click
      this.check2.checked=false;
      this.valorcheck1=this.check1.checked;
     
    }

    else{// cuando inicia la aplicacion
    
    setTimeout(() => {
      this.valorcheck2=false;
        this.valorcheck1=true;
    }, 10);
     
    
    
  }


 

  //Carga los datos
  await this.firestoreService.getcollection<Tarea>(this.path).subscribe(res=>{
 
       if(res.length){
        this.datos=res;
       //console.log('Datos: fila 393 '+JSON.stringify(this.datos, null, 2));
        this.actulizarFecha(res);
       }
       else{console.log('No hay datos');}
    
  });

    
 
      
      

   this.encabezado='Presupuesto Primera Quincena de '+this.mesQuincena.charAt(0).toUpperCase() + this.mesQuincena.slice(1).toLowerCase();
   this.filtroStatus();
   setTimeout(() => {
     this.modal2.dismiss();
   }, 100);   
      
  
    
  }

  async actulizarFecha(datos:Tarea[] ) {

    const mesactual = this.capitalizar(moment().locale('es').format('MMMM'));
   
   
    if (this.capitalizar(this.mesQuincena) === mesactual) { //si el mes actual es igual al mes seleccionado en determinar quincena, (si esta menor que 9 el mes anterior)

 
     // console.log('Datos para el forecha pag403: ' + JSON.stringify(datos, null, 2));

      await datos.forEach(tarea => {
        if (tarea.status === 'Pendiente') { 
         
        }

        else{//si la tarea esta completada
          
        if  (moment( tarea.fecha).locale('es').format('MMMM')!== moment().locale('es').format('MMMM')){// si el mes de la tarea no es igual al mes actual
          if (tarea.categoria !== 'Esporadico') {//si no es variable y esta completado actualiza la fecha
            
            const fechamesActual =  moment(tarea.fecha, 'YYYY-MM-DD').set('month', moment().month()); //convierte al mes actual
            tarea.fecha = fechamesActual.format('YYYY-MM-DD');
            tarea.status='Pendiente';
            
            this.firestoreService.createdoc(tarea,this.path, tarea.id);

          } 

          else{//si es esporadico y esta completado lo elimina
            this.firestoreService.deletedoc(tarea.id,this.path);
          }
        }
        }
        
      });

 // console.log('actulizar todos los datos: '+JSON.stringify(actulizarMesActual, null, 2));
 
 this.todoList= await this.datos.filter(tarea=>{
  return tarea.quincena ==='Primera'|| tarea.quincena ==='Siempre';
});



this.datos= this.todoList.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
this.todoList.forEach((tarea)=>{
  if(tarea.quincena==="Siempre"){
    tarea.fecha= moment().locale('es').date(15).format('YYYY-MM-DD');
  }
});


this.filtroStatus();


    }

   else{// si el mes actual no es el mes seleccionado en determinar quincena

    console.log('else');
    this.todoList=await this.datos.filter(tarea=>{
      return tarea.quincena ==='Primera'|| tarea.categoria ==='Siempre'
      
    });
    
    this.todoList.forEach((tarea)=>{
      if(tarea.quincena==="Siempre"){
        tarea.fecha= moment().locale('es').date(15).format('YYYY-MM-DD');
      }
    });

   this.datos= this.todoList.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  
   this.filtroStatus();
   }

  
  }

  totalP(){
    this.totalPresupuesto=0;
        
    this.todoList.forEach((tarea)=>{
      this.totalPresupuesto=tarea.monto+ this.totalPresupuesto;
    })
  }



  async onChange2(ev: any) {
    
     if(ev!== null && ev.detail.checked===true){
      this.valorcheck2=this.check2.checked;
      this.check1.checked=false;
     
    }

    else{
    
    
      setTimeout(() => {
        this.valorcheck1=false;
        this.valorcheck2=true;
      }, 10);
       
    
  }
      
      

      this.firestoreService.getCollectionquery<Tarea>(this.path,'quincena','in',['Segunda','Siempre']).subscribe( res=>{
        this.datos=res;
        
        this.todoList=res.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).filter(tarea=>{
          return tarea.status=='Pendiente';
        });

        this.todoList.forEach((tarea)=>{
          if(tarea.quincena==="Siempre"){
            tarea.fecha= moment().locale('es').date(30).format('YYYY-MM-DD');
          }
        });


        this.encabezado='Presupuesto Segunda Quincena de '+this.mesQuincena.charAt(0).toUpperCase() + this.mesQuincena.slice(1).toLowerCase();
        this.filtroStatus();
        this.totalPresupuesto=0;

        this.todoList.forEach((tarea)=>{
          this.totalPresupuesto=tarea.monto+ this.totalPresupuesto;
        })
        setTimeout(() => {
          this.modal2.dismiss();
        }, 100);
      });
    
      
    
  }


  determinarquicena(){
    const fechaActual = new Date();
    const diaActual = fechaActual.getDate();
    
    

    if (diaActual < 9 ){ //diaActual < 9 lo correcto
      
      this.mesQuincena = moment().subtract(1, 'months').locale('es').format('MMMM'); // Subtract 1 month from the current date mes anterior
      this.onChange2(null);
     
    }

    else{
      this.mesQuincena = moment().locale('es').format('MMMM');//mes actual

      if (diaActual >= 9 && diaActual <= 20) {
      
        this.onChange(null);
        
        
      } else {
       
        this.onChange2(null);
      }
      
    }

    
  
  }

  activarresaltado(task:Tarea){
    const mesActual = moment().format('MMMM');
    const mesTarea =moment(task.fecha).format('MMMM');
if(mesTarea !== mesActual && task.status==='Pendiente'){
  return true;
}
else{
  return false;}


  }


  onWillDismiss(ev: any){
    console.log('onwilldismiss'+ev);

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
