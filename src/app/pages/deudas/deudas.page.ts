import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import * as moment from 'moment';
import { convertToParamMap } from '@angular/router';
import { ActionSheetController,AlertController,LoadingController, NavController, ToastController  } from '@ionic/angular';
import { Deuda, Pago } from '../models';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-deudas',
  templateUrl: './deudas.page.html',
  styleUrls: ['./deudas.page.scss'],
})
export class DeudasPage implements OnInit {

  deudas:Deuda[]=[];
  pago:Pago[]=[];
  private myForm: FormGroup;
  status ='visualizando';
  uid='';
  private path= 'usuarios/'+this.uid+'/deudas/';
  loading:any;
  mesSeleccion: string[] =[moment(new Date()).locale('es').format('MMMM')];
  segmentoSeleccion='Todos';


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
    status:  '',
    monto: 0,
    mes:   new Date(this.date).getMonth().toString(),
    dia:   new Date().getDay().toString(),
    anio:  moment(this.date).format('yyyy'),

  }

async guardardatos(){
 await this.showLoading().then(res=>{
  this.newDeuda.status='Pendiente';
  this.firestoreservice.createdoc(this.newDeuda,this.path, this.newDeuda.id).then(res=>{
    this.loading.dismiss();
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
            this.paraeditar(deuda);
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
  if(res){
    console.log(res);
    this.log.getUid().then(resp=>{
     this.path='usuarios/'+this.log.Uid+'/deudas';
     this.fechaa();
    // this.filtroMes();
     valor = true;
    }).catch(err=>{console.log(err);});
    
  }
  else{this.alertaLogin();
  valor = false;}
  });
  
  return valor;
  }
  changeSegment(ev: any) {
    this.segmentoSeleccion = ev.detail.value;}

  async filtroMes(){
    let listado: Deuda[] = []
    this.deudas=[];
      if(this.mesSeleccion.length!==0){this.firestoreservice.getCollectionquery<Deuda>(this.path,'mes','in',this.mesSeleccion).subscribe(
        res=>{
  
         
          if(res ){
  
            if(this.segmentoSeleccion=== 'Todos'){
              this.deudas= res;
              
            }
            else{
                res.forEach(deuda=>{
                            if(deuda.status.includes(this.segmentoSeleccion)){
                              this.deudas.push(deuda);
                            }
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
