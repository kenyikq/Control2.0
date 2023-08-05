import { Injectable, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore/';
import { take } from 'rxjs';
import { CollectionReference, doc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { environment } from 'src/environments/environment'; //npm install firebase angularfire2 --save
import { FirebaseauthService } from './firebaseauth.service';
import { map } from 'rxjs/operators';
import { Pago } from '../pages/models';



@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  // Initialize Firebase
 app = initializeApp(environment.firebase);


// Initialize Cloud Firestore and get a reference to the service
 db = getFirestore(this.app);

  constructor(public database: AngularFirestore,
    public log: FirebaseauthService, 
   ) {  }

  
   

 createdoc(data: any, path: string, id: string){
  const collection=this.database.collection(path);
  return collection.doc(id).set(data);
  
 }


 getDoc<tipo>(path: string, id: string ){

  const collection= this.database.collection<tipo>(path);
  return collection.doc(id).valueChanges();

 
}

getCollectionquery<tipo>(path: string, campo: string, condicion: any, valor: any){
  const collection = this.database.collection<tipo>(path, ref => ref.where(campo, condicion, valor)
  ).valueChanges();
  
  

  return collection;

}




createColletion(path:string, collectionData:any){
  const collection =  this.database.collection(path).add(collectionData);
  return collection;
}


actualizarColeccion(path: string, documentId: string, newData: any) {
  // documentId es el ID del documento que deseas actualizar
  // newData es un objeto que contiene los datos nuevos que deseas agregar o actualizar

  this.database.collection(path).doc(documentId).set(newData, { merge: true })
    .then(() => {
      console.log('Documento actualizado exitosamente.');
    })
    .catch((error) => {
      console.error('Error al actualizar el documento:', error);
    });
}


 deletedoc(id:string, path:string){
  const collection= this.database.collection(path)
  return collection.doc(id).delete();

 }

 async updateStatus(status: string, id:string, path:string){
  let msj:any=""
  const collection= await this.database.collection(path)
  collection.doc(id).ref.update({
    status: status
  });
 

 }

 getid(){
  return this.database.createId();
  
 }

 getcollection<tipo>(path: string){
  const collection= this.database.collection<tipo>(path);
  return collection.valueChanges();
 }

 getultimopago<tipo>(path: string){
  const collectionRef= this.database.collection<tipo>(path, (ref) =>
  ref.orderBy('timestamp', 'desc').limit(1)
);

return collectionRef as tipo;


}

deleteCollection(path:string) {
  const collectionRef = this.database.collection(path);
  return collectionRef.get().subscribe((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      doc.ref.delete();
    });
  });

  
}

async updateFecha(fecha: string, id:string, path:string){
  
  const collection= await this.database.collection(path)
  collection.doc(id).ref.update({
    fecha: fecha
  });
 

 }
 

}
