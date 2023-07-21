import { Component, OnInit, inject } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import * as moment from 'moment';
import { ActionSheetController, AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Registro } from '../models';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.page.scss'],
})
export class MovimientosPage implements OnInit {


  registros: Registro[] = [];
  status = 'visualizando';
  uid = '';
  private path = '';
  private myForm: FormGroup;
  loading: any;
  totalIngreso=0;
  totalGasto=0;
  mesSeleccion =moment(new Date()).locale('es').format('MMMM');
  segmentoSeleccion='Todos';


  constructor(public firestoreservice: FirestoreService,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
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




  date = moment(new Date()).format('YYYY-MM-DD');



  ngOnInit() {
    this.fechaa();// para cargar el mes y el dia

  }


  newRegistro: Registro = {
    id: this.firestoreservice.getid(),
    fecha: this.date,
    fechaCreacion: new Date(this.date),
    categoria: '',
    subcategoria: '',
    concepto: '',
    monto: 0,
    mes: new Date(this.date).getMonth().toString(),
    dia: new Date().getDay().toString(),
    anio: moment(this.date).format('yyyy'),

  }

  async guardardatos() {

    if (this.myForm.valid) {
      await this.showLoading().then(res => {
        
        this.firestoreservice.createdoc(this.newRegistro, this.path, this.newRegistro.id).then(res => {
          this.loading.dismiss();
          this.presentToast('Registro guardado Correctamente');
          this.nuevoregistro();
          this.status = 'visualizando';
        }).catch(error => {
          this.presentToast('Error al intentar guardar registro: ' + error.toString());
          this.loading.dismiss();
        }).catch(error => {
          this.loading.dismiss();
        });


      });
    }

    else {
      this.alerta("Debe llenar todos los campos requeridos.");
      this.EventoTouched();
    }

  }

  verificarErrores() {
    for (const control in this.myForm.controls) {
      if (this.myForm.controls.hasOwnProperty(control)) {
        if (this.myForm.controls[control].errors) {
          console.log('Error en el control:', control);
        }
      }
    }
  }

  fechaa() {
    this.newRegistro.dia = moment(this.date).format('D');
    this.newRegistro.mes = moment(this.date).locale('es').format('MMMM');
    this.newRegistro.fecha=this.date;
    this.newRegistro.anio = moment(this.date).format('yyyy');
    
  }


  changeSegment(ev: any) {
    this.segmentoSeleccion = ev.detail.value;
    this.filtroMes();

  


      
  }

  totales(){
    this.totalGasto=0;
      this.totalIngreso=0;
    this.registros.forEach((registro)=>{
    
      if (registro.categoria === 'Ingresos'){
          this.totalIngreso = this.totalIngreso+ registro.monto;
       
      }

      if (registro.categoria === 'Gastos'){
        this.totalGasto = this.totalGasto+ registro.monto;
    }


    });
  }



  getregistros() {
    this.firestoreservice.getcollection<Registro>(this.path).subscribe(res => {
      if(res){
        this.registros = res;
      
        this.totales();
      }
     
    });
  }

  mostrar(ve: Registro) {
    console.log(ve);
  }

  async presentActionSheet(registro: Registro) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Acciones',
      buttons: [
        {
          text: 'Borrar',
          role: 'destructive',
          icon: 'trash',
          data: {
            action: 'borrar',
          },
          handler: () => {
            this.eliminar(registro);
          },
        },
        {
          text: 'Editar',
          data: {
            action: 'Editar',
          },
          icon: 'create-outline',
          handler: () => {
            this.paraeditar(registro);
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close-circle-outline',
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

  async presentToast(msg = 'Accion realizada correctamente') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }

  async eliminar(registro: Registro) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      subHeader: 'Confirmacion',
      message: 'Seguro que desea eliminar este registro?',
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
          this.firestoreservice.deletedoc(registro.id, this.path).then(res => {
            this.presentToast('Registro eliminado Correctamente');
          }).catch(error => {
            this.presentToast('Error al intentar eliminar registro: ' + error.toString());
          });

        },
      },
      ],
    });

    await alert.present();
  }


  nuevoregistro() {
    this.newRegistro = {
      id: this.firestoreservice.getid(),
      fecha: this.date,
      fechaCreacion: new Date(this.date),
      categoria: '',
      subcategoria: '',
      concepto: '',
      monto: 0,
      mes: new Date(this.date).getMonth().toString(),
      dia: new Date().getDay().toString(),
      anio: moment(this.date).format('yyyy'),

    }

  }

  cancelar() {
    this.nuevoregistro();
    this.status = 'visualizando';
  }
  paraeditar(registro: Registro) {
    this.status = 'editando';
    this.newRegistro = registro;
    this.date= this.newRegistro.fecha;
  }

  EventoTouched() {
    Object.keys(this.myForm.controls).forEach(controlKey => {
      const control = this.myForm.get(controlKey);
      control?.markAsTouched();
    });
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


 async idusuario(){ 
  
  let valor= true;
  await this.log.stateauth().subscribe(res=>{

    if (res !== null){
      
      this.uid= res.uid;
      
      this.path='usuarios/'+this.uid+'/movimientos';

  
     this.fechaa();
     this.filtroMes();
     valor = true;
   
    
  }
  else{this.alertaLogin();
  valor = false;}
  });
  
  return valor;
  }

  async filtroMes(){
  let listado: Registro[] = []
  this.registros=[];
    if(this.mesSeleccion.length!==0){this.firestoreservice.getCollectionquery<Registro>(this.path,'mes','==',this.mesSeleccion).subscribe(
      res=>{

       
        if(res ){

          if(this.segmentoSeleccion=== 'Todos'){
            this.registros= res;
            this.totales();
          }
          else{
              res.forEach(registro=>{
                          if(registro.categoria.includes(this.segmentoSeleccion)){
                            this.registros.push(registro);
                          }
                        });
 
                        this.totales();
          }

         
        }

       
      }
      
    );

    
  }
  else{this.alerta('Debe seleccionar un mes');}
}
  


}
