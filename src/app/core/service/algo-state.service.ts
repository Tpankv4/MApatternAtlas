import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlgoStateService {

  private variableToStore: string = "AlgoState";
  private variableForAlgoData: string = "AlgoDataVar";
  private tmpstore: string = "";
  constructor() { }
  
  saveAlgoState(algorithm: string){
	  //localStorage.setItem(this.variableToStore, algorithm);
	  this.tmpstore = algorithm;
  }
  
  getAlgoState() {
	  //let data = localStorage.getItem(this.variableToStore);
	  //return data;
	  return this.tmpstore;
  }

  clearAlgoState() {
    //localStorage.removeItem(this.variableToStore);
	this.tmpstore = "";
  }
  
  saveAlgorithmData(data: any){
	  localStorage.setItem(this.variableForAlgoData, JSON.stringify(data));
  }
  
  getAlgorithmData(){
	  let algodata = JSON.parse(localStorage.getItem(this.variableForAlgoData));
	  return algodata;
  }
  
  clearAlgorithmData() {
    localStorage.removeItem(this.variableForAlgoData);
  }

  cleanAll() {
    localStorage.clear();
  }
  
}
