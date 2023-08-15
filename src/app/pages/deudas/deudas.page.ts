import { FirebaseauthService } from './../../services/firebaseauth.service';
import { Component, ComponentFactoryResolver, OnInit, ViewChild  } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import * as moment from 'moment';
import { convertToParamMap } from '@angular/router';
import { ActionSheetController,AlertController,IonInput,IonSelect,LoadingController, NavController, ToastController  } from '@ionic/angular';
import { Deuda, Pago } from '../models';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-deudas',
  templateUrl: './deudas.page.html',
  styleUrls: ['./deudas.page.scss'],
})
export class DeudasPage implements OnInit {
  
  @ViewChild('modal') modal: any;
  @ViewChild('montoAPagar') montoAPagar: IonInput;
  @ViewChild('selecTipoPago') selecTipoPago: IonSelect;
  
  saldo=0;
  montoPendiente=0;
  deudas:Deuda[]=[];
  pago:Pago={id:this.firestoreservice.getid(),
    fechaCreacion: new Date (),
    fechaPago: new Date() ,
    TipoPago: '',
    pago: 0,
    montoPendiente:0};
  private myForm: FormGroup;
  private formPago: FormGroup;
  status ='visualizando';
  uid='';
  private path= 'usuarios/'+this.uid+'/deudas/';
  ultimoPago:Pago;
  loading:any;
  mesSeleccion =moment(new Date()).locale('es').format('MMMM');
  segmentoSeleccion='Pendiente';


  constructor(public firestoreservice: FirestoreService,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl:LoadingController,
    private toastController: ToastController,
    private alertController: AlertController, 
    public formBuilder: FormBuilder,
    public log: FirebaseauthService,
    public navCtrl: NavController,
    ) { 
      this.idusuario().then(res=>{
  
      });
   

      this.myForm = this.formBuilder.group({
        categoria: ['', Validators.required],
        subcategoria: ['', Validators.required],
        monto: ['', [Validators.required, Validators.min(1)]],
      });

      this.formPago=this.formBuilder.group({
        tipoP: ['', Validators.required],
        montoP: ['', [Validators.required, Validators.min(1)]],
      });
    }




  date= moment(new Date()).format('YYYY-MM-DD');



  ngOnInit() {
    this.fechaa();// para cargar el mes y el dia
    

  }

  newDeuda: Deuda= {
    id: this.firestoreservice.getid(),
    fecha:this.date,
    fechaPago: moment(new Date()).format('YYYY-MM-DD'),
    TipoPrestamo: '',
    acreedor:  '',
    concepto:  '',
    status:  'Pendiente',
    monto: 0,
    montoPendiente: 0,
    pagos:[],
    mes:   new Date(this.date).getMonth().toString(),
    dia:   new Date().getDay().toString(),
    anio:  moment(this.date).format('yyyy'),

  }

async guardardatos(){
 await this.showLoading().then(res=>{
  this.newDeuda.status='Pendiente';
  this.newDeuda.montoPendiente=this.newDeuda.monto;
  this.firestoreservice.createdoc(this.newDeuda,this.path, this.newDeuda.id).then(res=>{
    this.loading.dismiss();
   this.nuevodeuda();
    this.presentToast('Datos agregados Correctamente');
    this.status='visualizando';
    }).catch(error=>{
      this.presentToast('Error al intentar guardar registro: '+ error.toString());
   });
   

 });
 
}
  fechaa(){
   this.newDeuda.dia= moment(this.date).format('D');
   this.newDeuda.mes = moment(this.date).locale('es').format('MMMM');
   this.newDeuda.anio = moment(this.date).format('yyyy');
  }


  determinarTipoPago(){
    
    if(this.selecTipoPago.value==='Saldo'){
      this.pago.TipoPago=this.selecTipoPago.value;
      this.pago.pago= this.saldo;
      this.montoPendiente=0;
      this.montoAPagar.disabled = true;
    }
    else{
      this.pago.TipoPago=this.selecTipoPago.value;
      this.montoAPagar.disabled = false;
      
      this.montoAPagar.value=null;
      this.montoAPagar.setFocus();
      
    }
  }

 async aplicarPago(){
    if(this.formPago.valid && this.pago.pago> 0){
      const pendiente = this.montoPendiente;// calcula el valor pendiente luego del pago
      

      this.pago.montoPendiente=this.montoPendiente;
      this.newDeuda.montoPendiente= pendiente;
      
      

      if  (this.montoPendiente === 0){
        this.newDeuda.status='Saldado';
        this.pago.TipoPago='Saldo';
        
      }
      
      
      this.newDeuda.pagos.push(this.pago);
    

     this.firestoreservice.createdoc(this.newDeuda, this.path, this.newDeuda.id).then(()=>{

        this.presentToast('Pago aplicado Correctamente');
      this.pago ={id:this.firestoreservice.getid(),
        fechaCreacion: new Date(),
        fechaPago: new Date() ,
        TipoPago: 'Abono',
        pago: 0,
        montoPendiente:0};

      });

      this.modal.dismiss();
    }
    else{
      this.alerta('Favor llenar todos los campos');
    }


  }

  limpiarPagos(){
    this.pago ={id:this.firestoreservice.getid(),
      fechaCreacion: new Date(),
      fechaPago: new Date() ,
      TipoPago: 'Abono',
      pago: 0,
      montoPendiente:0};

  }

async mostrarforPago(deuda:Deuda){

  this.ultimoPago={id:this.firestoreservice.getid(),
  fechaCreacion: new Date(),
  fechaPago: new Date() ,
  TipoPago: 'Abono',
  pago: 0,
  montoPendiente:0};



  if(deuda.pagos === undefined || deuda.pagos.length ===0){
   
    this.saldo = deuda.monto;
    
  }

  else{

    const OrdenPorFecha = deuda.pagos.sort((a, b) => new Date (a.fechaPago).getTime() - new Date (b.fechaPago).getTime());
    
    this.ultimoPago = (OrdenPorFecha[OrdenPorFecha.length - 1]); 
    
    this.saldo=this.ultimoPago.montoPendiente;
    console.log(this.saldo);
    
  }
  this.newDeuda= deuda;
  
  
  this.modal.present();
  
  
}
  

  async presentActionSheet(deuda:Deuda) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones',
      translucent: true,
      cssClass:'agregar',
      
      buttons: [
        {
          text: 'Borrar',
          role: 'destructive',
          icon:'trash',
          data: { 
            action: 'borrar',
          },
          handler: ()=>{ 
           this.eliminar(deuda);
          },
        },
        {
          text: 'Editar',
          data: {
            action: 'Editar',
          },
          icon:'create-outline',
          handler: ()=>{ 
            this.paraeditar(deuda);
          },
        },

        {
          text: 'Pagar',
          data: {
            action: 'Pagar',
          },
          icon:'wallet-outline',
          handler: ()=>{ 
            this.mostrarforPago(deuda);
          },
        },

        {
          text: 'Cancelar',
          role: 'cancel',
          icon:'close-circle-outline',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  async showLoading() {
    this.loading = await this.loadingCtrl.create({
      cssClass: 'normal',
      message: 'Guardando...',
      //duration: 3000,
    });

    this.loading.present();
  }

  async presentToast(msg='Accion realizada correctamente') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }

  async eliminar(deuda: Deuda) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      subHeader: 'Confirmacion',
      message: 'Seguro que desea eliminar este deuda?',
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
          this.firestoreservice.deletedoc(deuda.id,this.path).then(res=>{
              this.presentToast('Dato eliminado Correctamente');
            }).catch(error=>{
              this.presentToast('Error al intentar eliminar dato: '+ error.toString());
           });
          
        },
      },
    ],
    });

    await alert.present();
  }

  onInputChanged(event: any) {
    const textoIngresado = event.target.value;
    if  (event.target.value===null|| event.target.value===0){this.montoPendiente=this.saldo}
    this.montoPendiente = this.saldo-textoIngresado;

    if(this.montoPendiente < 0 ){
      this.alerta('El monto ingresado es mayor que el monto pendiente');
    }
  }


nuevodeuda(){
  this.newDeuda= {
    id: this.firestoreservice.getid(),
    fecha:this.date,
    fechaPago: moment(new Date()).format('YYYY-MM-DD'),
    TipoPrestamo: '',
    acreedor:  '',
    concepto:  '',
    status:  '',
    monto: 0,
    montoPendiente: 0,
    pagos:[],
    mes:   new Date(this.date).getMonth().toString(),
    dia:   new Date().getDay().toString(),
    anio:  moment(this.date).format('yyyy'),

  }
  
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


cancelar(){
  this.nuevodeuda();
  this.status='visualizando';
}




paraeditar(deuda: Deuda){
  
  this.status='editando';
  this.newDeuda= deuda;
  this.date= this.newDeuda.fecha;
}

async idusuario(){ 
  
  let valor= true;
  await this.log.stateauth().subscribe(res=>{

    if (res !== null){
      
      this.uid= res.uid;
      
      this.path='usuarios/'+this.uid+'/deudas';

  
     this.fechaa();
     this.cargarDeudas();
     valor = true;
   
    
  }
  else{this.alertaLogin();
  valor = false;}
  });
  
  return valor;
  }


  changeSegment(ev: any) {
    this.segmentoSeleccion = ev.detail.value;
    console.log(this.segmentoSeleccion);
    this.cargarDeudas();
  }

  async cargarDeudas(){
    
    
      if(this.mesSeleccion.length!==0){this.firestoreservice.getcollection<Deuda>(this.path).subscribe(
        //'mes','==',this.mesSeleccion
        res=>{
          this.deudas=[];
         
          if(res ){
            this.deudas= res;
            if(this.segmentoSeleccion === 'Todos'){
              this.deudas= res;
            
              
            }
            else{

                this.deudas= res.filter((deuda)=>{
                  return deuda.status === this.segmentoSeleccion;
                });
                

                          
            }
  
           
          }
  
         
        }
        
      );
  
      
    }
    else{this.alerta('Debe seleccionar un mes');}
  }
     
  async alerta(msgAlerta: string) {
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
