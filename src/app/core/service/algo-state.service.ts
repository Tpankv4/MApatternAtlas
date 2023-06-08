import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlgoStateService {

  private variableToStore: string = "AlgoState";
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

  cleanAll() {
    localStorage.clear();
  }
  
}
