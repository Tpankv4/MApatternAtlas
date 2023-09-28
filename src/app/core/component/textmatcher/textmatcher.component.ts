import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import { Observable } from 'rxjs'


import * as keyextract from 'keyword-extractor/lib/keyword_extractor';
export interface Cat {
		name: string
	}

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
	
	//showMatchingResults = false;
	showMatchingResults: boolean;
	resultAlgorithm: any;
	resultAlgorithm2: any;
	resultAlgorithm3: any;
	
	numbers = [1,3,5,10];
	selectednumber = 3;
	
	tabledata = new MatTableDataSource([{name: "test", similarityvalue: 1}]); // initial value not needed
	fulltabledata: any;
	tabledata2 = new MatTableDataSource([{name: "test", cosineSimilarity: 1}]); // initial value not needed
	fulltabledata2: any;
	columnsToDisplay = ['name', 'similarityvalue'];
	columnsToDisplay2 = ['name', 'cosineSimilarity'];

    constructor(public dialogRef: MatDialogRef<TextmatcherComponent>,
              private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data) { 
			  //onbackground click bessere lösung...
			  dialogRef.disableClose = true;
			 
	}

  
    ngOnInit(): void {
		
		this.showMatchingResults = false;
		//eventuell noch on backgroud klick methode
		console.log("this.data.prev.length");
		console.log(this.data.prev.length);
		if(this.data.prev.length > 0) {
			this.resultAlgorithm = this.data.prev[0].resultAlgorithm;
			this.resultAlgorithm2 = this.data.prev[0].resultAlgorithm2;
			this.resultAlgorithm3 = this.data.prev[0].resultAlgorithm3;
			this.tabledata = this.data.prev[0].tabledata;
			this.tabledata2 = this.data.prev[0].tabledata2;
			this.fulltabledata = this.data.prev[0].fulltabledata;
			this.fulltabledata2 = this.data.prev[0].fulltabledata2;
			this.columnsToDisplay = this.data.prev[0].columnsToDisplay;
			this.columnsToDisplay2 = this.data.prev[0].columnsToDisplay2;
			//this.filter.setValue(this.data.prev.filtervalue);
			console.log("oldfiltervlaue:");
			console.log(this.data.prev[0].filtervalue);
			
			//noch testen!
			if (this.data.prev[0].filtervalue != ''){
				this.filter = new FormControl(this.data.prev[0].filtervalue);
				//this.filter.updateValueAndValidity();
			}else{
				this.filter = new FormControl('');
			}
			this.showMatchingResults = true;
		}else{
			this.filter = new FormControl('');
		}
		
	    //this.filter = new FormControl('');
		console.log("prev hier!");
		console.log(this.data.prev);
		
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
	
	numberChanged() {
		this.tabledata.data = this.fulltabledata.slice(0, this.selectednumber);
		this.tabledata2.data = this.fulltabledata2.slice(0, this.selectednumber);
	}
	
	closeDialog(algorithmName: string) {
		let previous = {resultAlgorithm: this.resultAlgorithm,
			resultAlgorithm2: this.resultAlgorithm2,
			resultAlgorithm3: this.resultAlgorithm3,
			tabledata: this.tabledata,
			tabledata2: this.tabledata2,
			fulltabledata: this.fulltabledata,
			fulltabledata2: this.fulltabledata2,
			columnsToDisplay: this.columnsToDisplay,
			columnsToDisplay2: this.columnsToDisplay2,
			filtervalue: this.filter.value,};
		console.log(previous);
			
		this.dialogRef.close({algoname: algorithmName, prev: previous});
	}
	
	//background klick noch machen!
	closeDialog2() {
		let previous = {resultAlgorithm: this.resultAlgorithm,
			resultAlgorithm2: this.resultAlgorithm2,
			resultAlgorithm3: this.resultAlgorithm3,
			tabledata: this.tabledata,
			tabledata2: this.tabledata2,
			fulltabledata: this.fulltabledata,
			fulltabledata2: this.fulltabledata2,
			columnsToDisplay: this.columnsToDisplay,
			columnsToDisplay2: this.columnsToDisplay2,
			filtervalue: this.filter.value,};
		console.log(previous);
			
		this.dialogRef.close({algoname: undefined, prev: previous});
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
	
	openLink2(algname){
		let alg = this.data.data.filter(algorithm => algorithm.name == algname);
		    if(alg.length > 0){	
			    //window.open(alg[0].href, '_blank');
				this.closeDialog(algname);
		    };
	}
	//resetText(){
	//	this.showMatchingResults = false;
	//	this.filter.setValue("");
	//}
	/*getAllCats() {
			this.http.get('http://localhost:5070/api/cats').subscribe(data => {
			console.log(data);
			});
        }
	*/
	
	getAllCats(): Observable<Cat[]> {
		return this.http.get<Cat[]>('http://localhost:8000/api/cats')
	}
	postdatatest(cat: Cat) {
		return this.http.post<Cat>('http://localhost:8000/api/cats/', cat);
	}
	
	//works with backend as intended :D
	extractInformation2(isRake){
		let datatosend = {input: this.filter.value, algodata: this.infos};
		let url = 'http://localhost:8000/api/matcher/';
		if(isRake){
			url = url + 'rake/' 
		}
		this.http.post<any[]>(url, datatosend).subscribe(data => {
			this.tabledata2.data = data;
			this.fulltabledata2 = this.tabledata2.data;
			console.log("tabledata");
			console.log(this.fulltabledata2);
			this.tabledata2.data = this.fulltabledata2.slice(0, this.selectednumber);
		});
	}

  
    extractInformation(isRake) {
		
		this.postdatatest({name: "dieda"}).subscribe(data => {
			console.log(data);
		});
		this.getAllCats().subscribe(data => {
			console.log(data);
		});
		
		//this.http.post('http://localhost:8000/api/matcher/', this.data.data).subscribe(data => {
		//	console.log(data);
		//});
		this.extractInformation2(isRake);
		
		
		
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
		
		// sort for 3 highest
		similarities.sort((a, b) => b.similarityvalue - a.similarityvalue);
		
		console.log("sorted results");
		console.log(similarities);
		this.tabledata.data = similarities;
		this.fulltabledata = this.tabledata.data;
		console.log(this.fulltabledata);
		this.tabledata.data = this.fulltabledata.slice(0, this.selectednumber);
		//this.tabledata.data = this.fulltabledata.filter( resultdata => {
		//	return resultdata.slice(0, this.selectednumber);
		//});
		
		//aktuell nur 1 als ergebniss, selbst wenn bei 2 die similarity gleich ist...
		const maximum = similarities.reduce(function(prev, current) {
			return (prev.similarityvalue > current.similarityvalue) ? prev : current;
		});
		
		console.log(similarities[0].name);
		
		
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
		sim.sort((a, b) => b.cosineSimilarity - a.cosineSimilarity);
		console.log("cosine similarity with keywords");
		console.log(sim);
		
		//this.tabledata2.data = sim;
		//this.fulltabledata2 = this.tabledata2.data;
		//console.log(this.fulltabledata2);
		//this.tabledata2.data = this.fulltabledata2.slice(0, this.selectednumber);
		
		
		
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
