import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlgoStateService {

  private variableToStore: string = "AlgoState";
  private variableForAlgoData: string = "AlgoDataVar";
  constructor() { }
  
  saveAlgoState(algorithm: string){
	  localStorage.setItem(this.variableToStore, algorithm);
  }
  
  getAlgoState() {
	  let data = localStorage.getItem(this.variableToStore);
	  return data;
  }

  clearAlgoState() {
    localStorage.removeItem(this.variableToStore);
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
