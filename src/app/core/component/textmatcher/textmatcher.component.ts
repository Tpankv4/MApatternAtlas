import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

import * as keyextract from 'keyword-extractor/lib/keyword_extractor';

@Component({
  selector: 'pp-textmatcher',
  templateUrl: './textmatcher.component.html',
  styleUrls: ['./textmatcher.component.scss']
})
export class TextmatcherComponent implements OnInit {
	
	
    filter: FormControl;
	extractedAlgorithmInformation = []; //array of arrays with extracted keywords
	infos = [];
	keyword_extractor: any;
	
	showMatchingResults = false;
	resultAlgorithm: string;

    constructor(public dialogRef: MatDialogRef<TextmatcherComponent>,
              private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data) { 
			 
			 
	}

  
    ngOnInit(): void {
	    this.filter = new FormControl('');
		
		//let href = "https://platform.planqk.de/qc-catalog/algorithms/fae60bca-d2b6-4aa2-88b7-58caace34179";
		let href = "https://platform.planqk.de/algorithms/fae60bca-d2b6-4aa2-88b7-58caace34179";
		this.data.data.forEach(algorithm => {
			if((algorithm.href !== "")&&(algorithm.href != null)){
				let splitarray = algorithm.href.split("platform.planqk.de");
				let datahref = splitarray[0] + "platform.planqk.de/qc-catalog" + splitarray[1];
				this.http.get(datahref).subscribe(algodata => {
					this.infos.push({name: algorithm.name, data: algodata});
				});
			}else{
				//get storage data -> save relevant keywords in case http get fails
			}
		});
		
    }
   
    openLink(){
		let alg = this.data.data.filter(algorithm => algorithm.name == this.resultAlgorithm);
		if(alg.length > 0){	
			window.open(alg[0].href, '_blank');
		};
    }
	
	resetText(){
		this.showMatchingResults = false;
		this.filter.setValue("");
	}
  
    extractInformation() {
		// todo:
		//
		// keywords: applicationAras, problem types -> iterate array arrayobject.label    noch learning methods?
		//infos.intent   infos.problem   infos.solution
		//infos.computationmodel höheres gewicht?
		// verschiedene gewichtung
		// regex um [2] sowas rauszumaachen?
		//eventuell noch in innit verschiedben bzw ergebnisse speichern damit nur 1x alles gezogen werden muss
		
	    this.keyword_extractor = keyextract;
		//todo check if property exists
		let allkeywords = [];
		let results = [];
		this.infos.forEach(algorithminfo => {
			//double value
			const intentkeywords = this.keyword_extractor.extract(algorithminfo.data.intent,{
			    language:"english",
			    remove_digits: true,
			    return_changed_case:true,
			    remove_duplicates: false
		    });
			const problemkeywords = this.keyword_extractor.extract(algorithminfo.data.problem,{
			    language:"english",
			    remove_digits: true,
			    return_changed_case:true,
			    remove_duplicates: false
		    });
			const solutionkeywords = this.keyword_extractor.extract(algorithminfo.data.solution,{
			    language:"english",
			    remove_digits: true,
			    return_changed_case:true,
			    remove_duplicates: false
		    });
			
			//quadruple value
			let applicationareaskeywords = []; 
			let problemtypeskeywords = [];
			algorithminfo.data.applicationAreas.forEach(word => {
				applicationareaskeywords.push(word.label);
				applicationareaskeywords.push(word.label);
				applicationareaskeywords.push(word.label);
				applicationareaskeywords.push(word.label);
			});
			algorithminfo.data.problemTypes.forEach(word => {
				problemtypeskeywords.push(word.label);
				problemtypeskeywords.push(word.label);
				problemtypeskeywords.push(word.label);
				problemtypeskeywords.push(word.label);
			});
			
			allkeywords.push({name: algorithminfo.name, 
			                  keywords: intentkeywords.concat(intentkeywords).concat(problemkeywords, solutionkeywords)
							            .concat(applicationareaskeywords, problemtypeskeywords)});
		});
		
		allkeywords.forEach(algo => {
			const occurrences = algo.keywords.reduce(function (acc, curr) {
			return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc}, {});
			results.push({name: algo.name, occurrences: occurrences});
		});
		console.log("occurrences for each algorithm");
		console.log(results);

		let similarities = [];
		const extraction_result_input =
	        this.keyword_extractor.extract(this.filter.value,{
			    language:"english",
			    remove_digits: true,
			    return_changed_case:true,
			    remove_duplicates: false
		    });
			
		results.forEach( alg => {
			let filterarray = extraction_result_input.filter(keyword => alg.occurrences.hasOwnProperty(keyword));
			let resultvalue = 0;
			filterarray.forEach(relevantkeyword => {
				resultvalue += alg.occurrences[relevantkeyword];
			});
		    similarities.push({name: alg.name, matchingkeywords: filterarray, similarityvalue: resultvalue});
	    });
		console.log("results");
		console.log(similarities);
		
		//aktuell nur 1 als ergebniss, selbst wenn bei 2 die similarity gleich ist...
		const maximum = similarities.reduce(function(prev, current) {
			return (prev.similarityvalue > current.similarityvalue) ? prev : current;
		});
		if(maximum.similarityvalue > 0){
			console.log(maximum.name);
			this.showMatchingResults = true;
			this.resultAlgorithm = maximum.name;
		}else{
			console.log("no similarities found!");
		}

  }

}
