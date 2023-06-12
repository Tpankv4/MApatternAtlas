import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'pp-create-algorithm',
  templateUrl: './create-algorithm.component.html',
  styleUrls: ['./create-algorithm.component.scss']
})
export class CreateAlgorithmComponent implements OnInit {

  patterns: any[];
  res = [];
  name: string;
  
  //todo: form control!
  
  constructor(public dialogRef: MatDialogRef<CreateAlgorithmComponent>,
             @Inject(MAT_DIALOG_DATA) public data) {
				 this.patterns = data.patterns;
  }

  ngOnInit(): void {
	  
  }
  
  closeDialog() {
	  if(this.res.length > 0){
		  const result = { name: this.name, patterns: this.res };
		  this.dialogRef.close(result);
	  } else {
		  alert("no patterns selected!");
	  }
  }

}
