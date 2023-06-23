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
				//get storage data
			}
		});
		
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

        /*
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
			    remove_duplicates: false
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
			    remove_duplicates: false
		    });
			
			//etwas abändern hier
	    let similarites = [];
	    this.extractedAlgorithmInformation.forEach( keywords => {
		    let similarKeywords = extraction_result_input.filter(function(el) {
		    return keywords.keywords.indexOf(el) >= 0;
		    }); //.length hier falls notwendig
		    similarites.push({name: keywords.name, matchingkeywords: similarKeywords});
	    });
	    console.log(similarites);
	    //console.log(this.infos);
		*/
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
		if(maximum > 0){
			console.log(maximum);
		}else{
			console.log("no similarities found!");
		}

  }

}
