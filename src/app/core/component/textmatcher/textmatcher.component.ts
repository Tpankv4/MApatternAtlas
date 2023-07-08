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
	
	
    filter: FormControl; //umbenennen!
	extractedAlgorithmInformation = []; //array of arrays with extracted keywords
	infos = [];
	keyword_extractor: any;
	
	showMatchingResults = false;
	resultAlgorithm: any;
	resultAlgorithm2: any;
	resultAlgorithm3: any;

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
	
	closeDialog(algorithmName: string) {
		this.dialogRef.close(algorithmName);
	}
   
    openLink(number){
		if(number == 1){
			let alg = this.data.data.filter(algorithm => algorithm.name == this.resultAlgorithm.name);
		    if(alg.length > 0){	
			    //window.open(alg[0].href, '_blank');
				this.closeDialog(this.resultAlgorithm.name);
		    };
		}
		if(number == 2){
			let alg = this.data.data.filter(algorithm => algorithm.name == this.resultAlgorithm2.name);
		    if(alg.length > 0){	
			    //window.open(alg[0].href, '_blank');
				this.closeDialog(this.resultAlgorithm2.name);
		    };
		}
		if(number == 3){
			let alg = this.data.data.filter(algorithm => algorithm.name == this.resultAlgorithm3.name);
		    if(alg.length > 0){	
			    //window.open(alg[0].href, '_blank');
				this.closeDialog(this.resultAlgorithm3.name);
		    };
		}
    }
	
	//resetText(){
	//	this.showMatchingResults = false;
	//	this.filter.setValue("");
	//}
  
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
			this.resultAlgorithm = maximum;
		}else{
			console.log("no similarities found!");
		}
		
		// cosine similarity with keywords
		let sim = [];
		results.forEach(alg => {
			sim.push({name: alg.name, cosineSimilarity: this.textCosineSimilarity2(alg.occurrences, extraction_result_input)});
		});
		console.log("cosine similarity with keywords");
		console.log(sim);
		const maximumkey = sim.reduce(function(prev, current) {
			return (prev.cosineSimilarity > current.cosineSimilarity) ? prev : current;
		});
		this.resultAlgorithm2 = maximumkey;
		
		//cosine similarity with text
		let sim2 = this.calculateTextCosineSimilarity();
		const maximumtext = sim2.reduce(function(prev, current) {
			return (prev.cosineSimilarity > current.cosineSimilarity) ? prev : current;
		});
		this.resultAlgorithm3 = maximumtext;

    }
	
	//-------------------------------------------------------- 
	// https://sumn2u.medium.com/string-similarity-comparision-in-js-with-examples-4bae35f13968
	
	calculateTextCosineSimilarity(){
		let cosinesimilarities = [];
		this.infos.forEach(algorithminfo => {
			let applicationareaskeywords2 = []; 
			let problemtypeskeywords2 = [];
			algorithminfo.data.applicationAreas.forEach(word => {
				applicationareaskeywords2.push(word.label);
				applicationareaskeywords2.push(word.label);
				applicationareaskeywords2.push(word.label);
				applicationareaskeywords2.push(word.label);
			});
			algorithminfo.data.problemTypes.forEach(word => {
				problemtypeskeywords2.push(word.label);
				problemtypeskeywords2.push(word.label);
				problemtypeskeywords2.push(word.label);
				problemtypeskeywords2.push(word.label);
			});
			let wordarray = algorithminfo.data.intent.concat(algorithminfo.data.intent).concat(algorithminfo.data.problem, algorithminfo.data.solution)
			              .concat(applicationareaskeywords2, problemtypeskeywords2);
			cosinesimilarities.push({name: algorithminfo.name, cosineSimilarity: this.textCosineSimilarity(wordarray, this.filter.value)});
		});
		console.log("cosinesimilarities for text:");
		console.log(cosinesimilarities);
		return cosinesimilarities;
		
	}
  
    termFreqMap(str) {
        let words = str.split(' ');
		//console.log(words);
		//console.log("hier");
        let termFreq = {};
        words.forEach(function(w) {
            termFreq[w] = (termFreq[w] || 0) + 1;
        });
		//console.log(termFreq);
        return termFreq;
    }
	
	termFreqMap2(array) {
        //let words = str.split(' ');
        let termFreq = {};
        array.forEach(function(w) {
            termFreq[w] = (termFreq[w] || 0) + 1;
        });
        return termFreq;
    }

    addKeysToDict(map, dict) {
        for (let key in map) {
            dict[key] = true;
        }
    }

    termFreqMapToVector(map, dict) {
        let termFreqVector = [];
        for (let term in dict) {
            termFreqVector.push(map[term] || 0);
        }
        return termFreqVector;
    }

    vecDotProduct(vecA, vecB) {
        let product = 0;
        for (let i = 0; i < vecA.length; i++) {
            product += vecA[i] * vecB[i];
        }
        return product;
    }

    vecMagnitude(vec) {
        let sum = 0;
        for (let i = 0; i < vec.length; i++) {
            sum += vec[i] * vec[i];
        }
        return Math.sqrt(sum);
    }

    cosineSimilarity(vecA, vecB) {
        return this.vecDotProduct(vecA, vecB) / (this.vecMagnitude(vecA) * this.vecMagnitude(vecB));
    }

    textCosineSimilarity(strA, strB) {
        let termFreqA = this.termFreqMap(strA);
        let termFreqB = this.termFreqMap(strB);

        let dict = {};
        this.addKeysToDict(termFreqA, dict);
        this.addKeysToDict(termFreqB, dict);

        let termFreqVecA = this.termFreqMapToVector(termFreqA, dict);
        let termFreqVecB = this.termFreqMapToVector(termFreqB, dict);

        return this.cosineSimilarity(termFreqVecA, termFreqVecB);
    }
	
	textCosineSimilarity2(occurences, input) {
        //let termFreqA = this.termFreqMap2(occurences);
        let termFreqB = this.termFreqMap2(input);

        let dict = {};
        this.addKeysToDict(occurences, dict);
        this.addKeysToDict(termFreqB, dict);

        let termFreqVecA = this.termFreqMapToVector(occurences, dict);
        let termFreqVecB = this.termFreqMapToVector(termFreqB, dict);

        return this.cosineSimilarity(termFreqVecA, termFreqVecB);
    }

}
