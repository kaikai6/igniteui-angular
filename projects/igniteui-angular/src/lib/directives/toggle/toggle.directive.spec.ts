import { ChangeDetectionStrategy, Component, DebugElement, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleActionDirective, IgxToggleDirective, IgxToggleModule } from './toggle.directive';
import { IgxOverlayService, OverlaySettings, ConnectedPositioningStrategy,
    AbsoluteScrollStrategy, AutoPositionStrategy } from '../../services';

describe('IgxToggle', () => {
    const HIDDEN_TOGGLER_CLASS = 'igx-toggle--hidden';
    const TOGGLER_CLASS = 'igx-toggle';
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxToggleActionTestComponent,
                IgxToggleActionSettingsComponent,
                IgxToggleServiceInjectComponent,
                IgxOverlayServiceComponent,
                IgxToggleTestComponent,
                TestWithOnPushComponent
            ],
            imports: [NoopAnimationsModule, IgxToggleModule]
        })
        .compileComponents();
    }));

    it('IgxToggleDirective is defined', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(IgxToggleDirective))).toBeDefined();
        expect(fixture.debugElement.query(By.css('ul'))).toBeDefined();
        expect(fixture.debugElement.queryAll(By.css('li')).length).toBe(4);
    });

    it('verify that initially toggled content is hidden', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();
        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
    });

    it('should show and hide content according \'collapsed\' attribute', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
        fixture.componentInstance.toggle.open();
        fixture.detectChanges();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classList.contains(TOGGLER_CLASS)).toBeTruthy();
    });

    it('should emit \'onOpened\' event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        spyOn(toggle.onOpened, 'emit');
        toggle.open();
        tick();
        fixture.detectChanges();

        expect(toggle.onOpened.emit).toHaveBeenCalled();
    }));

    it('should emit \'onClosed\' event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        fixture.componentInstance.toggle.open();
        tick();
        fixture.detectChanges();

        spyOn(toggle.onClosed, 'emit');
        toggle.close();
        tick();
        fixture.detectChanges();

        expect(toggle.onClosed.emit).toHaveBeenCalled();
    }));

    it('should propagate IgxOverlay onOpened/onClosed events', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxOverlayServiceComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        const overlay = fixture.componentInstance.overlay;
        spyOn(toggle.onOpened, 'emit');
        spyOn(toggle.onClosed, 'emit');

        toggle.open();
        tick();
        expect(toggle.onOpened.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(false);
        toggle.close();
        tick();
        expect(toggle.onClosed.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(true);

        toggle.open();
        tick();
        expect(toggle.onOpened.emit).toHaveBeenCalledTimes(2);
        const otherId = overlay.show(fixture.componentInstance.other);
        overlay.hide(otherId);
        tick();
        expect(toggle.onClosed.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(false);
        overlay.hideAll(); // as if outside click
        tick();
        expect(toggle.onClosed.emit).toHaveBeenCalledTimes(2);
        expect(toggle.collapsed).toBe(true);
    }));

    it('should open toggle when IgxToggleActionDiretive is clicked and toggle is closed', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();

        const button: DebugElement = fixture.debugElement.query(By.directive(IgxToggleActionDirective));
        const divEl: DebugElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classes[HIDDEN_TOGGLER_CLASS]).toBe(true);
        button.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classes[TOGGLER_CLASS]).toBe(true);
    }));
    it('should close toggle when IgxToggleActionDiretive is clicked and toggle is opened', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();
        fixture.componentInstance.toggle.open();
        tick();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const button: DebugElement = fixture.debugElement.query(By.directive(IgxToggleActionDirective));

        expect(divEl.classList.contains(TOGGLER_CLASS)).toBe(true);

        button.triggerEventHandler('click', null);

        tick();
        fixture.detectChanges();
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBeTruthy();
    }));

    it('should hide content and emit \'onClosed\' event when you click outside the toggle\'s content', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const toggle = fixture.componentInstance.toggle;
        const p = fixture.debugElement.query(By.css('p'));
        spyOn(toggle.onOpened, 'emit');

        fixture.componentInstance.toggleAction.onClick();
        tick();
        expect(toggle.onOpened.emit).toHaveBeenCalled();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classList.contains(TOGGLER_CLASS)).toBe(true);
        spyOn(toggle.onClosed, 'emit');

        p.nativeElement.click();
        tick();
        fixture.detectChanges();

        expect(toggle.onClosed.emit).toHaveBeenCalled();
    }));

    it('Toggle should be registered into navigaitonService if it is passed through identifier', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleServiceInjectComponent);
        fixture.detectChanges();

        const toggleFromComponent = fixture.componentInstance.toggle;
        const toggleFromService = fixture.componentInstance.toggleAction.target as IgxToggleDirective;

        expect(toggleFromService instanceof IgxToggleDirective).toBe(true);
        expect(toggleFromService.id).toEqual(toggleFromComponent.id);
    }));

    it('Toggle should working with parrent component and OnPush strategy applied.', fakeAsync(() => {
        const fix = TestBed.createComponent(TestWithOnPushComponent);
        fix.detectChanges();

        const toggle = fix.componentInstance.toggle;
        const toggleElm = fix.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const button: DebugElement = fix.debugElement.query(By.css('button'));

        spyOn(toggle.onOpened, 'emit');
        spyOn(toggle.onClosed, 'emit');
        button.triggerEventHandler('click', null);

        tick();
        fix.detectChanges();

        expect(toggle.onOpened.emit).toHaveBeenCalled();
        expect(toggleElm.classList.contains(TOGGLER_CLASS)).toBe(true);
        button.triggerEventHandler('click', null);

        tick();
        fix.detectChanges();

        expect(toggle.onClosed.emit).toHaveBeenCalled();
        expect(toggleElm.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
    }));

    describe('overlay settings', () => {
        it('should pass correct defaults from IgxToggleActionDiretive and respect outsideClickClose', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();
            spyOn(IgxToggleDirective.prototype, 'toggle');

            const defaults = /*<OverlaySettings>*/{
                positionStrategy: jasmine.any(ConnectedPositioningStrategy),
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy)
            };

            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(defaults);

            fixture.componentInstance.outsideClickClose = false;
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            defaults.closeOnOutsideClick = false;
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(defaults);
        }));

        it('should pass overlaySettings input from IgxToggleActionDiretive and respect outsideClickClose', () => {
            const fixture = TestBed.createComponent(IgxToggleActionSettingsComponent);
            fixture.detectChanges();
            spyOn(IgxToggleDirective.prototype, 'toggle');

            const settings = /*<OverlaySettings>*/{
                positionStrategy: jasmine.any(ConnectedPositioningStrategy),
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy)
            };

            // defaults
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);

            // override modal and strategy
            fixture.componentInstance.settings.modal = true;
            fixture.componentInstance.settings.positionStrategy = new AutoPositionStrategy();
            settings.modal = true;
            settings.positionStrategy = jasmine.any(AutoPositionStrategy);
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);

            // override close on click
            fixture.componentInstance.settings.closeOnOutsideClick = false;
            settings.closeOnOutsideClick = false;
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);
        });

        it('Should fire toggle "onClosing" event when closing through closeOnOutsideClick', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxToggleActionSettingsComponent);
            fixture.detectChanges();

            const toggle = fixture.componentInstance.toggle;

            spyOn(toggle, 'toggle').and.callThrough();
            spyOn(toggle.onClosed, 'emit').and.callThrough();
            spyOn(toggle.onClosing, 'emit').and.callThrough();
            spyOn(toggle.onOpening, 'emit').and.callThrough();
            spyOn(toggle.onOpened, 'emit').and.callThrough();

            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            button.click();
            tick();
            fixture.detectChanges();

            expect(toggle.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(toggle.onOpened.emit).toHaveBeenCalledTimes(1);

            document.documentElement.dispatchEvent(new Event('click'));
            tick();
            fixture.detectChanges();

            expect(toggle.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(toggle.onClosed.emit).toHaveBeenCalledTimes(1);
        }));
    });
});

@Component({
    template: `
    <div igxToggle #toggleRef="toggle" (onOpen)="open()" (onClose)="close()">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    `
})
export class IgxToggleTestComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    public open() {}
    public close() {}
}
@Component({
    template: `
    <button [igxToggleAction]="toggleRef"
    [closeOnOutsideClick]="outsideClickClose">Open/Close Toggle</button>
    <div igxToggle #toggleRef="toggle">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    <p>Test</p>
    `
})
export class IgxToggleActionTestComponent {
    public outsideClickClose = true;
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective) public toggleAction: IgxToggleActionDirective;
}


@Component({
    template: `
    <button [igxToggleAction]="toggleRef"
    [closeOnOutsideClick]="outsideClickClose" [overlaySettings]="settings">Open/Close Toggle</button>
    <div igxToggle #toggleRef="toggle">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    <p>Test</p>
    `
})
export class IgxToggleActionSettingsComponent {
    public outsideClickClose = true;
    public settings: OverlaySettings = {};
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective) public toggleAction: IgxToggleActionDirective;
}

@Component({
    template: `
        <button igxToggleAction="toggleID">Open/Close Toggle</button>
        <div igxToggle id="toggleID">
            <p>Some content</p>
        </div>
    `
})
export class IgxToggleServiceInjectComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective) public toggleAction: IgxToggleActionDirective;
}

@Component({
    template: `
        <div igxToggle id="toggleID">
            <p>Some content</p>
        </div>
        <div #other> <p>Some more content</p> </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IgxOverlayServiceComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(`other`) public other: ElementRef;
    /**
     *
     */
    constructor(public overlay: IgxOverlayService) {}
}


@Component({
    template: `
        <button igxToggleAction="toggleID">Open/Close Toggle</button>
        <div igxToggle id="toggleID">
            <p>Some content</p>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestWithOnPushComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
}
