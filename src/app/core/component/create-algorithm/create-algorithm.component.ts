import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import * as keyextract from 'keyword-extractor/lib/keyword_extractor';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'pp-create-algorithm',
  templateUrl: './create-algorithm.component.html',
  styleUrls: ['./create-algorithm.component.scss']
})
export class CreateAlgorithmComponent implements OnInit {

  patterns: any[];
  res = [];
  opt = [];
  name: string;
  filter: FormControl;
  keyword_extractor: any;
  planqkref: string;
  
  infos: any;
  
  extractedAlgorithmInformation = []; //array of arrays with extracted keywords
  
  //todo: form control!
  
  constructor(public dialogRef: MatDialogRef<CreateAlgorithmComponent>,
              private http: HttpClient,
             @Inject(MAT_DIALOG_DATA) public data) {
				 this.patterns = data.patterns;
  }

  ngOnInit(): void {
	  this.filter = new FormControl('');
	  
	  let href = "https://platform.planqk.de/qc-catalog/algorithms/fae60bca-d2b6-4aa2-88b7-58caace34179";
	  this.http.get(href).subscribe(data => {
		  this.infos = data;
	  });
	  
  }
  
  //remove!!! relic of old times (testing)
  extractInformation(){
	  this.keyword_extractor = keyextract;
	  const textToExtract = "The Deutsch algorithm (named after David Deutsch [1]), though having little to no practical use, was the first quantum algorithm to have a proven speed-up compared to any classical method. The well-known Deutsch-Josza algorithm [2] is an extension of this algorith, which generalizes the problem in order to achieve a super-exponential speed-up.";
	  const textToExtract2 = "Quantum Annealing (QA) is a metaheuristic, which can be used for solving optimization problems or sampling from quantum distributions. At D-Wave Systems, this heuristic is implemented in hardware (so called quantum annealer), which takes the problem in form of a Quadratic Unconstrained Binary Optimization (QUBO) or Ising Model as input.";
      let allTexts = [];
	  allTexts.push({name: "Deutsch Algorithm", description: textToExtract});
	  allTexts.push({name: "Quantum Annealing", description: textToExtract2});
	  
	  allTexts.forEach( textoftexts => {
		  const extraction_result =
	      this.keyword_extractor.extract(textoftexts.description,{
			  language:"english",
			  remove_digits: true,
			  return_changed_case:true,
			  remove_duplicates: true
		  });
	  console.log("extraction result:");
	  console.log(extraction_result);
	  this.extractedAlgorithmInformation.push({name: textoftexts.name, keywords: extraction_result});
	  });
	  
	  const extraction_result_input =
	      this.keyword_extractor.extract(this.filter.value,{
			  language:"english",
			  remove_digits: true,
			  return_changed_case:true,
			  remove_duplicates: true
		  });
	  let similarites = [];
	  this.extractedAlgorithmInformation.forEach( keywords => {
		  let similarKeywords = extraction_result_input.filter(function(el) {
		  return keywords.keywords.indexOf(el) >= 0;
		  }); //.length hier falls notwendig
		  similarites.push({name: keywords.name, matchingkeywords: similarKeywords});
	  });
	  console.log(similarites);
	  //console.log(this.infos);
  }
  
  //eventuell nach erstellen direkt in database speichern!
  closeDialog() {
	  if(this.res.length > 0){
		  const result = { name: this.name, patterns: this.res , optional: this.opt, href: this.planqkref};
		  this.dialogRef.close(result);
	  } else {
		  alert("no patterns selected!");
		  console.log(this.filter.value);
	  }
  }

}
