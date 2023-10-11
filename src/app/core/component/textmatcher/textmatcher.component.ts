import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';


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
	
	checked = true;
	
	showMatchingResults: boolean;
	resultAlgorithm: any;
	
	numbers = [1,3,5,10];
	selectednumber = 3;
	
	tabledata = new MatTableDataSource([{name: "test", cosineSimilarity: 1}]); // initial value not needed
	fulltabledata: any;
	columnsToDisplay = ['name', 'cosineSimilarity'];

    constructor(public dialogRef: MatDialogRef<TextmatcherComponent>,
              private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data) { 
			  //onbackground click handler als andere lösung
			  dialogRef.disableClose = true;
			 
	}

  
    ngOnInit(): void {
		
		this.showMatchingResults = false;

		if(this.data.prev.length > 0) {
			this.resultAlgorithm = this.data.prev[0].resultAlgorithm;
			this.tabledata = this.data.prev[0].tabledata;
			this.fulltabledata = this.data.prev[0].fulltabledata;
			this.columnsToDisplay = this.data.prev[0].columnsToDisplay;
			
			if (this.data.prev[0].filtervalue != ''){
				this.filter = new FormControl(this.data.prev[0].filtervalue);
			}else{
				this.filter = new FormControl('');
			}
			this.showMatchingResults = true;
		}else{
			this.filter = new FormControl('');
		}
		
		
		let href = "https://platform.planqk.de/algorithms/fae60bca-d2b6-4aa2-88b7-58caace34179";
		this.data.data.forEach(algorithm => {
			if((algorithm.href !== "")&&(algorithm.href != null)){
				let splitarray = algorithm.href.split("platform.planqk.de");
				let datahref = splitarray[0] + "platform.planqk.de/qc-catalog" + splitarray[1];
				this.http.get(datahref).subscribe(algodata => {
					this.infos.push({name: algorithm.name, data: algodata});
				});
			}else{
				//do something if no href
			}
		});
		
    }
	
	checkboxClicked(event){
		if(this.checked){
			this.checked = false;
		}else{
			this.checked = true;
		}
	}
	
	numberChanged() {
		this.tabledata.data = this.fulltabledata.slice(0, this.selectednumber);
	}
	
	closeDialog(algorithmName: string) {
		let previous = {resultAlgorithm: this.resultAlgorithm,
			tabledata: this.tabledata,
			fulltabledata: this.fulltabledata,
			columnsToDisplay: this.columnsToDisplay,
			filtervalue: this.filter.value,};
		console.log(previous);
			
		this.dialogRef.close({algoname: algorithmName, prev: previous});
	}
	
	closeDialog2() {
		if((this.filter.value != '') && this.showMatchingResults){
			let previous = {resultAlgorithm: this.resultAlgorithm,
				tabledata: this.tabledata,
				fulltabledata: this.fulltabledata,
				columnsToDisplay: this.columnsToDisplay,
				filtervalue: this.filter.value,};
			console.log(previous);
			
			this.dialogRef.close({algoname: undefined, prev: previous});
		}else{
			this.dialogRef.close(null);
		}
	}
	
   
    openLink(){
		let alg = this.data.data.filter(algorithm => algorithm.name == this.resultAlgorithm.name);
		if(alg.length > 0){	
			this.closeDialog(this.resultAlgorithm.name);
		};
		
    }
	
	openLink2(algname){
		let alg = this.data.data.filter(algorithm => algorithm.name == algname);
		    if(alg.length > 0){	
				this.closeDialog(algname);
		    };
	}

	extractInformation(isRake){
		let datatosend = {input: this.filter.value, algodata: this.infos};
		let url = 'http://localhost:8000/api/matcher/';
		if(isRake){
			url = url + 'rake/';
		}
		
		if(this.checked){
			url = url + 'openai';
		}
		this.http.post<any[]>(url, datatosend).subscribe(data => {
			this.tabledata.data = data;
			this.fulltabledata = this.tabledata.data;
			console.log("tabledata");
			console.log(this.fulltabledata);
			this.tabledata.data = this.fulltabledata.slice(0, this.selectednumber);
			
			const maximumkey = this.fulltabledata.reduce(function(prev, current) {
				return (prev.cosineSimilarity > current.cosineSimilarity) ? prev : current;
			});
			
			if(maximumkey.cosineSimilarity > 0){
				console.log(maximumkey.name);
				this.showMatchingResults = true;
				this.resultAlgorithm = maximumkey;
			}else{
				this.showMatchingResults = false;
				console.log("no similarities found!");
			}
		});
	}

}
