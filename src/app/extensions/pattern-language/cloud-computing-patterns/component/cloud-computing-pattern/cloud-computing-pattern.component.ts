import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { PatternRenderingComponentInterface } from '../../../../../core/model/pattern-rendering-component.interface';
import { CloudComputingPatternsLoaderService } from '../../loader/cloud-computing-patterns-loader.service';
import { ActivatedRoute, Router } from '@angular/router';
import CloudComputingPattern from '../../model/cloud-computing-pattern';
import { IriConverter } from '../../../../../core/util/iri-converter';
import { TdTextEditorComponent } from '@covalent/text-editor';
import { MatDialog } from '@angular/material';
import { DialogData, MdEditorComponent } from '../../../../../core/component/md-editor/md-editor.component';
import { CloudComputingPatternsWriterService } from '../../writer/cloud-computing-patterns-writer.service';

@Component({
    selector: 'pp-cloud-computing-pattern',
    templateUrl: './cloud-computing-pattern.component.html',
    styleUrls: ['./cloud-computing-pattern.component.scss']
})
export class CloudComputingPatternComponent implements PatternRenderingComponentInterface, OnInit {

    @ViewChild('mdEditor') private _textEditor: TdTextEditorComponent;

    pId: string;
    pattern: CloudComputingPattern;
    mdEditorOptions = {};
    editMode = {
        intent: {showActionButtons: false},
        drivingQuestion: {showActionButtons: false},
        context: {showActionButtons: false},
        solution: {showActionButtons: false},
        solutionSketches: {showActionButtons: false},
        result: {showActionButtons: false},
    };

    constructor(private loader: CloudComputingPatternsLoaderService,
                private writer: CloudComputingPatternsWriterService,
                private cdr: ChangeDetectorRef,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private zone: NgZone,
                private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.loader.loadContentFromStore()
            .then(patternMap => {
                this.pattern = patternMap.get(IriConverter.convertIdToIri(this.pId));
                this.cdr.detectChanges();
            });
    }

    openEditor(field: string): void {
        const dialogRef = this.dialog.open(MdEditorComponent,
            {data: {field: field, label: this.pattern[field].label, content: this.pattern[field].value}});
        this.editMode[field].edit = true;
        dialogRef.afterClosed().subscribe(async (result: DialogData) => {
            this.pattern[field].value = result.content;
            await this.writer.writePatternToStore(this.pattern).catch(err => console.error(err));
        });
    }

    navigateBack(): void {
        this.zone.run(() => {
            this.router.navigate(['..'], {relativeTo: this.activatedRoute});
        });
    }
}
