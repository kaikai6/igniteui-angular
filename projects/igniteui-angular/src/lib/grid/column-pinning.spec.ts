
import { AfterViewInit, ChangeDetectorRef, Component, DebugElement, Input, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Calendar } from '../calendar';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxColumnPinningComponent, IgxColumnPinningModule } from './column-pinning.component';
import { IgxColumnComponent } from './column.component';
import { IgxGridComponent, IPinColumnEventArgs } from './grid.component';
import { IgxGridModule } from './index';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxDropDownComponent, IgxDropDownModule } from '../drop-down/drop-down.component';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { GridFunctions } from '../test-utils/grid-functions.spec';
import { GridTemplateStrings, ColumnDefinitions } from '../test-utils/template-strings.spec';
import { SampleTestData } from '../test-utils/sample-test-data.spec';

describe('Column Pinning UI', () => {
    let fix;
    let grid: IgxGridComponent;
    let columnChooser: IgxColumnPinningComponent;
    let columnChooserElement: DebugElement;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                GridWithColumnChooserComponent,
                ColumnPinningComponent,
                ColumnPinningToggleComponent,
                GridWithGroupColumnsComponent
            ],
            imports: [
                BrowserAnimationsModule,
                NoopAnimationsModule,
                IgxGridModule.forRoot(),
                IgxColumnPinningModule,
                IgxDropDownModule,
                IgxButtonModule
            ]
        })
        .compileComponents();
    });

    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(ColumnPinningComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        });

        afterAll(() => {
            UIInteractions.clearOverlay();
        });

        it ('title is initially empty.', () => {
            const title = columnChooserElement.query(By.css('h4'));
            expect(title).toBe(null);
        });

        it ('title can be successfully changed.', () => {
            columnChooser.title = 'Pin/Unpin Columns';
            fix.detectChanges();

            const titleElement = (columnChooserElement.query(By.css('h4')).nativeElement as HTMLHeadingElement);
            expect(columnChooser.title).toBe('Pin/Unpin Columns');
            expect(titleElement.textContent).toBe('Pin/Unpin Columns');

            columnChooser.title = undefined;
            fix.detectChanges();

            expect(columnChooserElement.query(By.css('h4'))).toBe(null);
            expect(columnChooser.title).toBe('');

            columnChooser.title = null;
            fix.detectChanges();

            expect(columnChooserElement.query(By.css('h4'))).toBe(null);
            expect(columnChooser.title).toBe('');
        });

        it('shows all checkboxes unchecked.', () => {
            const checkboxes = GridFunctions.getCheckboxInputs(columnChooserElement);
            expect(checkboxes.filter((chk) => !chk.checked).length).toBe(5);
        });

        it('- toggling column checkbox checked state successfully changes the column\'s pinned state.', () => {
            const checkbox = GridFunctions.getCheckboxInput('ReleaseDate', columnChooserElement, fix);
            GridFunctions.verifyCheckbox('ReleaseDate', false, false, columnChooserElement, fix);

            const column = grid.getColumnByName('ReleaseDate');
            verifyColumnIsPinned(column, false, 0);

            checkbox.click();

            expect(checkbox.checked).toBe(true);
            verifyColumnIsPinned(column, true, 1);

            checkbox.click();

            expect(checkbox.checked).toBe(false);
            verifyColumnIsPinned(column, false, 0);
        });

        it('reflects properly grid column pinned value changes.', () => {
            const name = 'ReleaseDate';
            GridFunctions.verifyCheckbox(name, false, false, columnChooserElement, fix);
            const column = grid.getColumnByName(name);

            column.pinned = true;
            fix.detectChanges();

            GridFunctions.verifyCheckbox(name, true, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, true, 1);

            column.pinned = false;
            fix.detectChanges();

            GridFunctions.verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = undefined;
            fix.detectChanges();

            GridFunctions.verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = true;
            fix.detectChanges();
            verifyColumnIsPinned(column, true, 1);

            column.pinned = null;
            fix.detectChanges();

            GridFunctions.verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);
        });

        it('onColumnPinning event is fired on toggling checkboxes.', () => {
            let currentArgs: IPinColumnEventArgs;
            let counter = 0;
            grid.onColumnPinning.subscribe((args: IPinColumnEventArgs) => {
                counter++;
                currentArgs = args;
            });

            GridFunctions.getCheckboxInput('ReleaseDate', columnChooserElement, fix).click();

            expect(counter).toBe(1);
            expect(currentArgs.column.field).toBe('ReleaseDate');
            expect(currentArgs.insertAtIndex).toBe(0);

            GridFunctions.getCheckboxInput('Downloads', columnChooserElement, fix).click();

            expect(counter).toBe(2);
            expect(currentArgs.column.field).toBe('Downloads');
            expect(currentArgs.insertAtIndex).toBe(1);

            GridFunctions.getCheckboxInput('ReleaseDate', columnChooserElement, fix).click();
            // TODO: Consider firing the event when unpinning!!!
            expect(counter).toBe(2);
            // expect(currentArgs.column.field).toBe('ReleaseDate');
            // expect(currentArgs.insertAtIndex).toBe(0);

            GridFunctions.getCheckboxInput('Downloads', columnChooserElement, fix).click();

            expect(counter).toBe(2);
            // expect(currentArgs.column.field).toBe('Downloads');
            // expect(currentArgs.insertAtIndex).toBe(0);

            GridFunctions.getCheckboxInput('ProductName', columnChooserElement, fix).click();

            expect(counter).toBe(3);
            expect(currentArgs.column.field).toBe('ProductName');
            expect(currentArgs.insertAtIndex).toBe(0);
        });

        it('doesn\'t pin columns if unpinned area width will become less than the defined minimum.', () => {
            const checkboxes = GridFunctions.getCheckboxInputs(columnChooserElement);
            checkboxes[0].click();
            checkboxes[1].click();
            checkboxes[2].click();

            verifyColumnIsPinned(grid.columns[0], true, 2);
            verifyColumnIsPinned(grid.columns[1], true, 2);
            verifyColumnIsPinned(grid.columns[2], false, 2);

        });

        it('doesn\'t pin columns if unpinned area width does not allow it even after hiding a pinned column.', () => {
            const checkboxes = GridFunctions.getCheckboxInputs(columnChooserElement);
            checkboxes[0].click();
            checkboxes[1].click();

            grid.columns[1].hidden = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(1);

            checkboxes[2].click();
            verifyColumnIsPinned(grid.columns[2], false, 1);

            checkboxes[0].click();
            verifyColumnIsPinned(grid.columns[0], false, 0);

            grid.columns[1].hidden = false;
            fix.detectChanges();

            GridFunctions.verifyCheckbox('ProductName', true, false, columnChooserElement, fix);
            verifyColumnIsPinned(grid.columns[1], true, 1);
        });

    });

    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(GridWithGroupColumnsComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        });

        it('shows only top level columns.', () => {
            const columnItems = columnChooser.columnItems;
            expect(columnItems.length).toBe(3);
            expect(columnItems[0].name).toBe('Missing');
            expect(columnItems[1].name).toBe('General Information');
            expect(columnItems[2].name).toBe('ID');
            expect(getColumnPinningItems().length).toBe(3);
        });

        it('- pinning group column pins all children.', () => {
            const columnName = 'General Information';
            GridFunctions.getCheckboxInput(columnName, columnChooserElement, fix).click();

            fix.detectChanges();
            GridFunctions.verifyCheckbox(columnName, true, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);
        });


        it('- unpinning group column unpins all children.', () => {
            const columnName = 'General Information';
            grid.columns[1].pin();
            fix.detectChanges();

            GridFunctions.verifyCheckbox(columnName, true, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);

            GridFunctions.getCheckboxInput(columnName, columnChooserElement, fix).click();

            fix.detectChanges();
            GridFunctions.verifyCheckbox(columnName, false, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => !col.pinned)).toBe(true);
        });
    });

    function getColumnPinningItems() {
        if (!columnChooserElement) {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        }
        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        return checkboxElements;
    }

    function verifyColumnIsPinned(column: IgxColumnComponent, isPinned: boolean, pinnedColumnsCount: number) {
        expect(column.pinned).toBe(isPinned, 'Pinned is not ' + isPinned);

        const pinnedColumns = column.grid.pinnedColumns;
        expect(pinnedColumns.length).toBe(pinnedColumnsCount, 'Unexpected pinned columns count!');
        expect(pinnedColumns.findIndex((col) => col === column) > -1).toBe(isPinned, 'Unexpected result for pinnedColumns collection!');
    }
});

export class GridData {

    public timeGenerator: Calendar = new Calendar();
    public today: Date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
}
@Component({
    template: `<div>
        <igx-column-pinning [columns]="grid1.columns"></igx-column-pinning>
        ${GridTemplateStrings.declareGrid(`#grid1 [height]="height" [width]="width"`, ``, ColumnDefinitions.productFilterable)}
    </div>`
})
export class ColumnPinningComponent extends GridData implements AfterViewInit {
    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
    @ViewChild(IgxColumnPinningComponent) public chooser: IgxColumnPinningComponent;

    public data = SampleTestData.productInfoData;
    public height = '500px';
    public width = '500px';

    constructor(private cdr: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        const downloadsColumn = this.grid.getColumnByName('Downloads');
        const productNameCol = this.grid.getColumnByName('ProductName');
        downloadsColumn.hidden = true;
        productNameCol.disableHiding = true;
        this.cdr.detectChanges();
    }
}

@Component({
    template: `<div>
    ${GridTemplateStrings.declareGrid(`#grid1 [height]="height" [width]="width"`, ``, ColumnDefinitions.productFilterable)}
    <button igxButton (click)="pinningUI.toggle()">Show Column Pinning UI</button>
    <igx-drop-down #pinningUI>
        <igx-column-pinning [columns]="grid1.columns"></igx-column-pinning>
    </igx-drop-down>
    </div>`
})
export class ColumnPinningToggleComponent extends ColumnPinningComponent {
    @ViewChild(IgxDropDownComponent) public dropDown: IgxColumnPinningComponent;
}

@Component({
    template: GridTemplateStrings.declareGrid(
        `[showToolbar]="true" [height]="height" [width]="width"`,
        ``,
        ColumnDefinitions.productFilterable)
})
export class GridWithColumnChooserComponent extends GridData implements AfterViewInit {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
    @ViewChild(IgxColumnPinningComponent) public chooser: IgxColumnPinningComponent;
    @ViewChild(IgxDropDownComponent) public dropDown: IgxDropDownComponent;


    public data = SampleTestData.productInfoData;
    public height = '500px';
    public width = '500px';

    ngAfterViewInit() {
        const downloadsColumn = this.grid.getColumnByName('Downloads');
        const productNameCol = this.grid.getColumnByName('ProductName');
        downloadsColumn.hidden = true;
        productNameCol.disableHiding = true;
    }
}

@Component({
    template: `<igx-column-pinning [columns]="grid.columns"></igx-column-pinning>
    <igx-grid [rowSelectable]="false" #grid [data]="data" displayDensity="compact">
    <igx-column [movable]="true" [hasSummary]="true" [resizable]="true" [pinned]="true" field="Missing"></igx-column>
    <igx-column-group [movable]="true" [pinned]="false" header="General Information">
        <igx-column [movable]="true" filterable="true" sortable="true" resizable="true" field="CompanyName"></igx-column>
        <igx-column-group [movable]="true" header="Person Details">
            <igx-column [movable]="true" [pinned]="false" filterable="true"
            sortable="true" resizable="true" field="ContactName"></igx-column>
            <igx-column [movable]="true" [hasSummary]="true" filterable="true" sortable="true"
            resizable="true" field="ContactTitle"></igx-column>
        </igx-column-group>
    </igx-column-group>
    <igx-column [movable]="true" [hasSummary]="true" [resizable]="true" field="ID" editable="true"></igx-column>
    </igx-grid>`
})
export class GridWithGroupColumnsComponent implements AfterViewInit {

    @ViewChild(IgxGridComponent) public grid: IgxGridComponent;
    @ViewChild(IgxColumnPinningComponent) public chooser: IgxColumnPinningComponent;

    data = SampleTestData.contactInfoData;
    // tslint:enable:max-line-length

    constructor(private cdr: ChangeDetectorRef) {}

    ngAfterViewInit(): void {
        this.cdr.detectChanges();
    }

}
