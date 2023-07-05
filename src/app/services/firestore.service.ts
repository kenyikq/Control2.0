import { Injectable, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore/';
import { take } from 'rxjs';
import { CollectionReference, doc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { environment } from 'src/environments/environment'; //npm install firebase angularfire2 --save
import { FirebaseauthService } from './firebaseauth.service';




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









 deletedoc(id:string, path:string){
  const collection= this.database.collection(path)
  return collection.doc(id).delete();

 }

 updatedoc(data: any, id:string, path:string){
  const collection= this.database.collection(path)
  return collection.doc(id).update(data);

 }

 getid(){
  return this.database.createId();
  
 }

 getcollection<tipo>(path: string){
  const collection= this.database.collection<tipo>(path);
  return collection.valueChanges();
 }

}
