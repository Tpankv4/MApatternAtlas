import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent, MatDialogRef } from '@angular/material';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/internal/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DialogPatternLanguageResult } from '../data/DialogPatternLanguageResult.interface';
import { ValidationService } from '../../core/service/validation.service';
import { PatternLanguageSectionRestriction } from '../../core/model/PatternLanguageSectionRestriction.model';


interface DialogData {
  plIri: string;
  plName: string;
}

@Component({
  selector: 'pp-create-edit-pattern-language',
  templateUrl: './create-edit-pattern-language.component.html',
  styleUrls: ['./create-edit-pattern-language.component.scss']
})
export class CreateEditPatternLanguageComponent implements OnInit {
  private sectionRestrictonValidators: ValidatorFn[];
  isAddLinkTypeDialog = false;

  types = [{name: 'directed_right', icon: 'trending_flat'}, {name: 'directed_left', icon: 'trending_flat'}, {
    name: 'undirected',
    icon: 'compare_arrows'
  }, {name: 'group', icon: 'merge_type'}];
  relationForm: FormGroup;


  get name(): AbstractControl {
    return this.patternLanguageForm.get('name');
  }

  get iconUrl(): AbstractControl {
    return this.patternLanguageForm.get('iconUrl');
  }

  get sectionsArray(): FormArray {
    return this.sectionDetailsGroup.get('sectionsArray') as FormArray;
  }

  get prefixArray(): FormArray {
    return this.prefixForm.get('prefixArray') as FormArray;
  }


  constructor(public dialogRef: MatDialogRef<CreateEditPatternLanguageComponent>, private _fb: FormBuilder, private cdr: ChangeDetectorRef,
              private validatorService: ValidationService, @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    this.filteredSections = this.sectionCtrl.valueChanges.pipe(
      startWith(null),
      map((section: string | null) => section ? this._filter(section) : this.sectionNames.slice()));

    this.relationForm = this._fb.group({
      toPattern: ['', [Validators.required]],
      direction: ['', [Validators.required]],
      description: ['', []],
    });

  }

  isFirstStep = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  sectionCtrl = new FormControl();
  filteredSections: Observable<string[]>;
  sections: string[] = ['Icon', 'Context', 'Driving Question', 'Solution'];
  sectionNames: string[] = ['Icon', 'Context', 'Driving Question', 'Solution', 'Solution Sketches'];
  patternLanguageForm: FormGroup;
  prefixForm: FormGroup;
  newPrefixForm: FormGroup;
  iconPreviewVisible = false;
  saveRequested = false;
  sectionDetailsGroup: FormGroup;


  options: string[] = [];
  restrictionOptions: string[] = ['only', 'some', 'min', 'exactly', 'max'];


  @Output() saveClicked = new EventEmitter<DialogPatternLanguageResult>();


  @ViewChild('sectionInput') sectionInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  plLanguages = ['CloudComputingPatterns', 'EIP'];

  ngOnInit(): void {
    const urlRegex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i;
    this.patternLanguageForm = this._fb.group({
      name: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9_-\s]+')]],
      iconUrl: ['', this.isAddLinkTypeDialog ? [] : [Validators.required, Validators.pattern(urlRegex)]]
    });
    this.iconUrl.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((urlValue) => {
      this.iconPreviewVisible = urlValue && (urlValue.startsWith('https://') || urlValue.startsWith('http://'));
    });

    this.sectionDetailsGroup = this._fb.group({
      sectionsArray: this._fb.array([])
    });

    this.prefixForm = this._fb.group({
      prefixArray: this._fb.array([
        new FormGroup({
          prefixname: new FormControl('xsd'),
          checked: new FormControl(true),
          uri: new FormControl('http://www.w3.org/2001/XMLSchema#'),
          values: new FormControl([
            'xsd:anyURI',
            'xsd:base64Binary',
            'xsd:boolean',
            'xsd:byte',
            'xsd:date',
            'xsd:dateTime',
            'xsd:dateTimeStamp',
            'xsd:dayTimeDuration',
            'xsd:decimal',
            'xsd:double',
            'xsd:float',
            'xsd:gDay',
            'xsd:gMonth',
            'xsd:gMonthDay',
            'xsd:gYear',
            'xsd:gYearMonth',
            'xsd:hexBinary',
            'xsd:int',
            'xsd:integer',
            'xsd:language',
            'xsd:long',
            'xsd:Name',
            'xsd:NCName',
            'xsd:NMTOKEN',
            'xsd:negativeInteger',
            'xsd:nonNegativeInteger',
            'xsd:nonPositiveInteger',
            'xsd:normalizedString',
            'xsd:positiveInteger',
            'xsd:short',
            'xsd:string',
            'xsd:time',
            'xsd:token',
            'xsd:unsignedByte',
            'xsd:unsignedInt',
            'xsd:unsignedLong',
            'xsd:unsignedShort'])
        }), new FormGroup({
          prefixname: new FormControl('dctype'),
          checked: new FormControl(true),
          uri: new FormControl('https://purl.org/dc/dcmitype/'),
          values: new FormControl(['dctype:Image', 'dctype:StillImage',
            'dctype:MovingImage',
            'dctype:Software',
            'dctype:Sound',
            'dctype:Service',
            'dctype:Event',
            'dctype:PhysicalObject',
            'dctype:Dataset',
            'dctype:Collection',
            'dctype:SizeOrDuration',
            'dctype:Text',
            'dctype:InteractiveResource'])
        })
      ])
    });

    this.updateValidatorsForSectionRestrctions(); // initialize the sectionrestrictions' validators
    this.prefixForm.valueChanges.subscribe(() => {
      this.updateAvailableOptions();
      this.updateValidatorsForSectionRestrctions();
    });

    this.newPrefixForm = this._fb.group({
      prefix: ['', []],
      uri: ['', []]
    });


  }


  add(event: MatChipInputEvent): void {
    // Add chip only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our section
      if ((value || '').trim()) {
        this.sections.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.sectionCtrl.setValue(null);
    }
  }

  removeSectionMatChip(section: string): void {
    const index = this.sections.indexOf(section);

    if (index >= 0) {
      this.sections.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (this.sections.indexOf(event.option.viewValue) !== -1) {
      return;
    }
    this.sections.push(event.option.viewValue);
    this.sectionInput.nativeElement.value = '';
    this.sectionCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.sectionNames.filter(section => section.toLowerCase().indexOf(filterValue) === 0);
  }

  onAddPrefix(): void {
    this.prefixArray.push(
      new FormGroup({
        prefixname: new FormControl(this.newPrefixForm.get('prefix').value),
        checked: new FormControl(true),
        uri: new FormControl(this.newPrefixForm.get('uri').value),
        values: new FormControl([])
      })
    );
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.saveRequested = true;
    if (this.patternLanguageForm.valid && this.sectionDetailsGroup.valid) {
      this.saveClicked.emit({
        restrictions: this.mapArrayToMap(this.sectionsArray.value),
        sections: this.sections,
        name: this.name.value,
        prefixes: this.prefixArray.value,
        iconUrl: this.iconUrl.value
      });
      this.dialogRef.close();
    }
  }

  addSectionRestriction(sectionName: string, i?: number): void {
    if (i === undefined || i === null && i !== 0) { // if no index specified, add at the end
      i = this.sectionsArray.length;
    }
    const newformGroup = new FormGroup({
      type: new FormControl('xsd:string', this.sectionRestrictonValidators),
      cardinality: new FormControl(0),
      restrictionType: new FormControl('only'),
      name: new FormControl(sectionName),
    });
    (<FormArray>this.sectionsArray).insert(i, newformGroup);

    this.cdr.detectChanges();
  }

  initForSecondStep(): void {
    this.saveRequested = true;
    this.patternLanguageForm.markAsTouched();
    (<any>Object).values(this.patternLanguageForm.controls).forEach(control => {
      control.markAsTouched();
    });
    if (this.patternLanguageForm.valid) {

      this.isFirstStep = false;
      while (this.sectionsArray.length > 0) {
        this.sectionsArray.removeAt(0);
      }
      this.sections.forEach((section) => this.addSectionRestriction(section));
    }
    this.updateAvailableOptions();
  }

  updateAvailableOptions(): void {
    this.options = [];
    for (const control of this.prefixArray.controls) {
      if (control.value.checked && control.value.values) {
        this.options.push(...control.value.values);
      }
    }
  }


  isCardinalityInputVisible(section: any): boolean {
    return section.value.restrictionType === 'max' || section.value.restrictionType === 'min' || section.value.restrictionType === 'exactly';
  }


  deleteSectionRestriction(i: number): void {
    this.sectionsArray.removeAt(i);
  }


  private updateValidatorsForSectionRestrctions() {

    const allowedPrefixes: string[] = [];
    for (const control of this.prefixArray.controls) {
      if (control.value.checked) {
        allowedPrefixes.push(control.value.prefixname);
      }
    }
    this.sectionRestrictonValidators = [Validators.required, ValidationService.startsWithValidPrefix(allowedPrefixes)];

    for (const control of this.sectionsArray.controls) {
      control.get('type').setValidators(this.sectionRestrictonValidators);

      // trigger validation:
      control.get('type').updateValueAndValidity();
      control.get('type').markAsDirty();
      control.get('type').markAsTouched();
    }
  }


  private mapArrayToMap(arrayRestrictions: any[]): Map<string, PatternLanguageSectionRestriction[]> {
    const restrictionMap = new Map<string, PatternLanguageSectionRestriction[]>();
    arrayRestrictions.forEach(sectionRestriction => {
      restrictionMap.set(sectionRestriction.name,
        restrictionMap.has(sectionRestriction.name) ?
          restrictionMap.get(sectionRestriction.name).concat(<PatternLanguageSectionRestriction> sectionRestriction) : [<PatternLanguageSectionRestriction> sectionRestriction]);
    });
    return restrictionMap;
  }
}

