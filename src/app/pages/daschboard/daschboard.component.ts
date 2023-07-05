import { Component, OnInit, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import { Chart, ChartData, ChartTooltipItem } from 'chart.js';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Datos, Registro } from '../models';
import * as moment from 'moment';
import { NavController, IonSegment  } from '@ionic/angular';






@Component({
  selector: 'app-daschboard',
  templateUrl: './daschboard.component.html',
  styleUrls: ['./daschboard.component.scss']
})


/*`
   <canvas #barChart></canvas>
  `*/

export class DaschboardComponent  implements AfterViewInit, OnInit {

  @ViewChild('barChart', { static: true }) barChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart', { static: true }) doughnutChart: ElementRef<HTMLCanvasElement>;
  @ViewChild('segment') segment: IonSegment; ;
 
  graficoBarras: Chart;
  graficocirular: Chart;

  uid='';
 @ViewChild("chart") chart: any;
  totales={
    gastos:0,
    ingresos:0
  };
  newdato:Datos={ mes:[],
  ingresos:[],
  gastos:[]};
  prueba:'titulo';
  
  path='';
  registros:Registro[]=[];
  mesSeleccion = moment(new Date()).locale('es').format('MMMM').charAt(0).toUpperCase() + moment(new Date()).locale('es').format('MMMM').slice(1);
  segmentoSeleccion='Todo';
  subcategoria={
    nombre:['',],
    monto:[0]
};


  
  meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];


  constructor(public firestoreService:FirestoreService,
              public log: FirebaseauthService,
              private navCtrl: NavController) {
                
    this.log.stateauth().subscribe( res=>{

       if (res !== null){
         
         this.uid= res.uid;
         
         this.path='usuarios/'+this.uid+'/movimientos';
         this.cargarDatos().then(()=>{
          
            this.resize().then(()=>{
              
              this.createBarChart();
           });
            
          
         });
        
       }
       else {
         this.uid='';
       }
     });

  
   }

  ngOnInit() {
   console.log();
  }
  ngAfterViewInit(){
   
    this.segment.value=this.mesSeleccion;
     
  }
  

 
  
   
  async filtroCategoria(){
    this.newdato.gastos=[];
    this.newdato.ingresos=[];
    let ingresos = 0;
    let gastos = 0;
  
   await this.graficoBarras.destroy();
    if(this.segmentoSeleccion=== 'Todo'){
      
              this.meses.forEach(mes=>{
               ingresos = 0;
                gastos = 0;
                      this.registros.forEach(registro=>{
                        
                          if(registro.mes===mes.toLowerCase()){
                            if(registro.categoria==='Gastos'){
                              
                              gastos= gastos +registro.monto;}
                              
                            if(registro.categoria==='Ingresos'){
                              ingresos= ingresos +registro.monto;
                            }
                            
                            
                          }

                        })
                        this.newdato.ingresos.push(ingresos);
                        this.newdato.gastos.push(gastos);
                                     
              });
       
              
              this.graficoBarras.destroy();
              this.createBarChart();  
    }

    if(this.segmentoSeleccion=== 'Ingresos'){
      
      this.meses.forEach(mes=>{
        ingresos = 0;
        gastos = 0;
        this.registros.forEach(registro=>{
            if(registro.mes===mes.toLocaleLowerCase()){
                
              if(registro.categoria==='Ingresos'){
                ingresos= ingresos +registro.monto;
              }
             
            }

          })
          this.newdato.ingresos.push(ingresos);
          
          this.newdato.gastos.push(gastos);
               
});

  
this.graficoBarras.destroy();

this.createBarChart();   

    }

    if (this.segmentoSeleccion=== 'Gastos'){
      this.meses.forEach(mes=>{
        ingresos = 0;
        gastos = 0;
        this.registros.forEach(registro=>{
            if(registro.mes===mes.toLocaleLowerCase()){
              if(registro.categoria==='Gastos'){
                
                gastos= gastos +registro.monto;}
          
             
            }

          })
          this.newdato.ingresos.push(ingresos);
         
          this.newdato.gastos.push(gastos);
          
               
});

this.createBarChart(); 
    }

   }


  async cargarCategoria(array: Registro[]){
   
this.subcategoria.nombre.splice(0);
this.subcategoria.monto.splice(0);
let suma=0;
this.totales.gastos= 0;
   
  await array.forEach(registro=>{
    
    
      if (registro.categoria==="Gastos"){
        if(this.subcategoria.nombre.includes(registro.subcategoria) === false){
          
          this.subcategoria.nombre.push(registro.subcategoria);
                    
        } 
        //suma los totales de la categoria de gastos   
        this.totales.gastos= this.totales.gastos + registro.monto; 
        
      }

      
    });



    
if ( this.subcategoria.nombre.length > 0)
{
  this.subcategoria.nombre.forEach(nombre=>{
    suma=0;
    array.forEach(registro => {
      if(registro.subcategoria===nombre){
        suma=suma+registro.monto;
      }
     });
     this.subcategoria.monto.push(suma);
  });

  

}
    

return this.subcategoria;

   }

   async cargarDatos(){
  
     await   this.firestoreService.getcollection<Registro>(this.path).subscribe(
        res=>{
          if(res ){
            this.registros= res;
           
            this.changeSegment2(this.mesSeleccion);
          

           
            
            // serie del grafico
              this.meses.forEach(mes=>{
                        let ingresos = 0;
                        let gastos = 0;
                        this.registros.forEach(registro=>{
                          if(registro.mes===mes.toLocaleLowerCase()){
                            if(registro.categoria==='Gastos'){
                              
                              gastos= gastos +registro.monto;}
                              
                            if(registro.categoria==='Ingresos'){
                              ingresos= ingresos +registro.monto;
                            }
                           
                          }

                        })
                       // this.newdato.mes.push(mes.charAt(0).toUpperCase() + mes.slice(1));
                        this.newdato.ingresos.push(ingresos);
                        this.newdato.gastos.push(gastos);
                                     
              })
          }
  
         
        }
        
      );
  
      
   

    return this.registros;
  }


  totalesMeses(){

  }

 


  // Otro código y métodos del componente...
  async resize(){
  
      
    //  this.onWindowResize(new Event('resize'));

    setTimeout(() => {
      (window as any).dispatchEvent(new Event('resize')); 
      this.createBarChart();
      this.createDonaChart();
     }, 5000);
   
   }

   changeSegment(ev: any) {
    this.segmentoSeleccion = ev.detail.value;
    this.filtroCategoria();
   
  
  }

  async changeSegment2(ev: any) {
    

    if(typeof ev === 'string'){
      this.mesSeleccion = ev.toLowerCase();
    }
    else{
      this.mesSeleccion =ev.detail.value.toLowerCase();
      this.graficocirular.destroy();
    }
   
    

    let array:Registro[]=[];
    console.log(this.registros);
    
    array = this.registros.filter(registro => registro.mes === this.mesSeleccion);
    
    
    
    this.cargarCategoria(array);
    this.createDonaChart();
     
    
   
  
  }

  async createDonaChart(){

    if(this.graficocirular){
      await this.graficocirular.destroy();
 
     }

     const canvas: HTMLCanvasElement = this.doughnutChart.nativeElement;
     const ctx = this.doughnutChart.nativeElement.getContext('2d');
     
     if (!ctx) {
      console.error('Canvas context is null.');
      return;
    }

    
    this.graficocirular = new Chart(ctx,{
    
      type: 'doughnut',
      data: {
        labels: this.subcategoria.nombre,
        datasets: [{
          data: this.subcategoria.monto,
          backgroundColor: [
            'rgba(163,221,203,0.2)',
            'rgba(232,233,161,0.2)',
            'rgba(230,181,102,0.2)',
            'rgba(229,112,126,0.2)',
            'rgba(54, 162, 235, 1)',
            '#FFD700',
            'red',
            '#ADFF2F',
            '#E0FFFF',
            'yellow',
            '#F08080',
            '#ADFF2F',
        ],// Color de fondo
        borderColor: [
            'rgba(163,221,203,1)',
            'rgba(232,233,161,2)',
            'rgba(230,181,102,3)',
            'rgba(229,112,126,4)',
        ],// Color del borde
        borderWidth: 2,// Ancho del borde
    
        }]
      },
      options: {
        // Configuración adicional del gráfico (opcional)
        tooltips: {
          callbacks: {
            label: function(tooltipItem: any, data: Chart.ChartData) {
              if (data && data.datasets && data.datasets.length > 0) {
                const dataset = data.datasets[tooltipItem.datasetIndex];
                if (dataset && dataset.data && dataset.data.length > 0) {
                  const value = dataset.data[tooltipItem.index];
                  const label = dataset.label || '';
  
                  if (typeof value === 'number') {
                    let total = 0;
                    for (const dataValue of dataset.data) {
                      if (typeof dataValue === 'number') {
                        total += dataValue;
                      }
                    }
  
                    const percentage = ((value / total) * 100).toFixed(0);
  
                    return [label+'Valor: ' + new Intl.NumberFormat().format(parseInt(String(value)))+' RD$' + '\n (' + percentage + '%)'];
                  }
                }
              }
  
              return [];
            }
          }
        }
      }
    });
  
  }



  
 async createBarChart() {
    if(this.graficoBarras){
     await this.graficoBarras.destroy();

    }
   
    

    const canvas: HTMLCanvasElement = this.barChart.nativeElement;
    const ctx = this.barChart.nativeElement.getContext('2d');
    
    // Código para inicializar y configurar el gráfico
    if (!ctx) {
      console.error('Canvas context is null.');
      return;
    }
   

    
    this.graficoBarras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.meses,
        
        datasets: [
          {
            label: 'Ingresos',
            data: this.newdato.ingresos,
           
            backgroundColor: '#ADFF2F',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Gastos',
            data: this.newdato.gastos,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              const value = tooltipItem.value || '';
              return 'Valor: ' + new Intl.NumberFormat().format(parseInt(value))+' RD$';
            }
          }
        },
        
        
        scales: {
          
          yAxes: [{
            display: false ,
            ticks: {
              beginAtZero: true,
              callback: function(value) {
                const numericValue = Number(value);
                if (!isNaN(numericValue) && numericValue >= 1000) {
                  return (numericValue / 1000) + ' mil';
                }
                return value;
              }
            }
          }]
        }
      },
    });
    
  } 
 
  

  /* {
      type: 'bar',
      data: {
        labels: ['Capital','Compra','Gasto','Venta'],
        datasets: [{
          label: '',  
          data: [5,10,15,20] ,
          backgroundColor: [
            '#E0FFFF',
            'yellow',
            '#F08080',
            '#ADFF2F',

          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            '#FFD700',
            'red',
            '#ADFF2F',
          ],
          borderWidth: 1.5,
          hoverBackgroundColor: [
            'rgba(54, 162, 235, 1)',
            '#FFD700',
            'red',
            'green',
          ]
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      },
    });



*/
}
