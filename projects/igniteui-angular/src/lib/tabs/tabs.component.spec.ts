import { Component, QueryList, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabsGroupComponent } from './tabs-group.component';
import { IgxTabsComponent, IgxTabsModule } from './tabs.component';

describe('IgxTabs', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TabsTestComponent, TabsTest2Component, TemplatedTabsTestComponent],
            imports: [IgxTabsModule]
        })
            .compileComponents();
    }));

    it('should initialize igx-tabs, igx-tabs-group and igx-tab-item', () => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        let groups: IgxTabsGroupComponent[];
        let tabsItems: IgxTabItemComponent[];

        fixture.detectChanges();

        groups = tabs.groups.toArray();
        tabsItems = tabs.tabs.toArray();

        expect(tabs).toBeDefined();
        expect(tabs instanceof IgxTabsComponent).toBeTruthy();
        expect(tabs.groups instanceof QueryList).toBeTruthy();
        expect(tabs.groups.length).toBe(3);

        for (let i = 0; i < tabs.groups.length; i++) {
            expect(groups[i] instanceof IgxTabsGroupComponent).toBeTruthy();
            expect(groups[i].relatedTab).toBe(tabsItems[i]);
        }

        expect(tabs.tabs instanceof QueryList).toBeTruthy();
        expect(tabs.tabs.length).toBe(3);

        for (let i = 0; i < tabs.tabs.length; i++) {
            expect(tabsItems[i] instanceof IgxTabItemComponent).toBeTruthy();
            expect(tabsItems[i].relatedGroup).toBe(groups[i]);
        }
    });

    it('should initialize default values of properties', () => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        let tabItems;

        expect(tabs.selectedIndex).toBe(-1);
        expect(tabs.selectedTabItem).toBeUndefined();

        fixture.componentInstance.tabSelectedHandler = () => {
            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedTabItem).toBe(tabItems[0]);
        };

        fixture.detectChanges();

        tabItems = tabs.tabs.toArray();
        expect(tabItems[0].disabled).toBeFalsy();
        expect(tabItems[1].disabled).toBeFalsy();
    });

    it('should initialize set/get properties', () => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabbar = fixture.componentInstance.tabs;
        const icons = ['library_music', 'video_library', 'library_books'];
        let tabItems;
        let groups;

        fixture.detectChanges();

        tabItems = tabbar.tabs.toArray();
        groups = tabbar.groups.toArray();

        for (let i = 0; i < tabItems.length; i++) {
            expect(groups[i].label).toBe('Tab ' + (i + 1));
            expect(groups[i].icon).toBe(icons[i]);
        }
    });

    it('should select/deselect tabs', () => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        let tabItems;
        let tab1: IgxTabItemComponent;
        let tab2: IgxTabItemComponent;

        expect(tabs.selectedIndex).toBe(-1);
        fixture.componentInstance.tabSelectedHandler = () => {
            expect(tabs.selectedIndex).toBe(0);
            expect(tabs.selectedTabItem).toBe(tab1);
        };

        fixture.detectChanges();
        tabItems = tabs.tabs.toArray();
        tab1 = tabItems[0];
        tab2 = tabItems[1];

        fixture.componentInstance.tabSelectedHandler = () => { };

        tab2.select();
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(1);
        expect(tabs.selectedTabItem).toBe(tab2);
        expect(tabs.selectedIndex).toBe(1);
        expect(tab2.isSelected).toBeTruthy();
        expect(tab1.isSelected).toBeFalsy();

        tab1.select();
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(0);
        expect(tabs.selectedTabItem).toBe(tab1);
        expect(tab1.isSelected).toBeTruthy();
        expect(tab2.isSelected).toBeFalsy();

        // select disabled tab
        tab2.relatedGroup.disabled = true;
        tab2.select();
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(0);
        expect(tabs.selectedTabItem).toBe(tab1);
        expect(tab1.isSelected).toBeTruthy();
        expect(tab2.isSelected).toBeFalsy();
    });

    it('check select selection when tabs collection is modified', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTest2Component);
        tick();

        const tabs = fixture.componentInstance.tabs;
        let tabItems;
        let tab1: IgxTabItemComponent;
        let tab3: IgxTabItemComponent;

        expect(tabs.selectedIndex).toBe(-1);
        expect(tabs.selectedTabItem).toBe(tab1);

        tick();
        fixture.detectChanges();

        tabItems = tabs.tabs.toArray();
        tab1 = tabItems[0];
        tab3 = tabItems[2];
        tick();

        fixture.componentInstance.tabSelectedHandler = () => { };

        tab3.select();

        tick(100);
        fixture.detectChanges();

        expect(tabs.selectedIndex).toBe(2);
        expect(tabs.selectedTabItem).toBe(tab3);
        expect(tab3.isSelected).toBeTruthy();

        fixture.componentInstance.resetCollectionFourTabs();
        fixture.detectChanges();
        tick(100);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(2);

        fixture.componentInstance.resetCollectionOneTab();
        fixture.detectChanges();
        tick(100);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(0);

        fixture.componentInstance.resetCollectionTwoTabs();
        fixture.detectChanges();
        tick(100);
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(0);

        fixture.componentInstance.resetToEmptyCollection();
        fixture.detectChanges();
        tick(100);
        fixture.detectChanges();
        expect(tabs.groups.length).toBe(0);
        expect(tabs.selectedTabItem).toBe(undefined);
    }));

    it('should initialize igx-tab custom template', () => {
        const fixture = TestBed.createComponent(TemplatedTabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.detectChanges();

        const tabItems: IgxTabItemComponent[] = tabs.tabs.toArray();
        expect(tabs.tabs.length).toBe(3);

        tabs.tabs.forEach((tabItem) => expect(tabItem.relatedGroup.customTabTemplate).toBeDefined());
    });

    it('should select next/previous tab when pressing right/left arrow', () => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.detectChanges();

        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.focus();
        let args = { key: 'ArrowRight', bubbles: true };
        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        expect(tabs.selectedIndex).toBe(1);

        tabs.tabs.toArray()[1].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        expect(tabs.selectedIndex).toBe(2);

        args = { key: 'ArrowLeft', bubbles: true };
        tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        expect(tabs.selectedIndex).toBe(1);
    });

    it('should select first/last tab when pressing home/end button', () => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.detectChanges();

        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.focus();

        let args = { key: 'End', bubbles: true };
        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        expect(tabs.selectedIndex).toBe(2);

        args = { key: 'Home', bubbles: true };
        tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new KeyboardEvent('keydown', args));
        expect(tabs.selectedIndex).toBe(0);
    });

    it('should scroll tab area when clicking left/right scroll buttons', fakeAsync(() => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.detectChanges();

        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '400px';
        fixture.detectChanges();

        const rightScrollButton = tabs.headerContainer.nativeElement.children[2];
        window.dispatchEvent(new Event('resize'));
        rightScrollButton.dispatchEvent(new Event('click', { bubbles: true }));

        tick(100);
        fixture.detectChanges();
        expect(tabs.offset).toBeGreaterThan(0);

        tabs.scrollLeft(null);

        tick(100);
        fixture.detectChanges();
        expect(tabs.offset).toBe(0);
    }));

    it('should select tab on click', () => {
        const fixture = TestBed.createComponent(TabsTestComponent);
        const tabs = fixture.componentInstance.tabs;
        fixture.detectChanges();

        fixture.componentInstance.wrapperDiv.nativeElement.style.width = '400px';
        fixture.detectChanges();

        tabs.tabs.toArray()[2].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(2);

        tabs.tabs.toArray()[0].nativeTabItem.nativeElement.dispatchEvent(new Event('click', { bubbles: true }));
        fixture.detectChanges();
        expect(tabs.selectedIndex).toBe(0);
    });
});

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs (onTabSelected)="tabSelectedHandler($event)">
                <igx-tabs-group label="Tab 1" icon="library_music">
                    <h1>Tab 1 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tabs-group>
                <igx-tabs-group label="Tab 2" icon="video_library">
                    <h1>Tab 2 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </igx-tabs-group>
                <igx-tabs-group label="Tab 3" icon="library_books">
                    <h1>Tab 3 Content</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Vivamus vitae malesuada odio. Praesent ante lectus, porta a eleifend vel, sodales eu nisl.
                        Vivamus sit amet purus eu lectus cursus rhoncus quis non ex.
                        Cras ac nulla sed arcu finibus volutpat.
                        Vivamus risus ipsum, pharetra a augue nec, euismod fringilla odio.
                        Integer id velit rutrum, accumsan ante a, semper nunc.
                        Phasellus ultrices tincidunt imperdiet. Nullam vulputate mauris diam.
                         Nullam elementum, libero vel varius fermentum, lorem ex bibendum nulla,
                         pretium lacinia erat nibh vel massa.
                        In hendrerit, sapien ac mollis iaculis, dolor tellus malesuada sem,
                        a accumsan lectus nisl facilisis leo.
                        Curabitur consequat sit amet nulla at consequat. Duis volutpat tristique luctus.
                    </p>
                </igx-tabs-group>
            </igx-tabs>
        </div>`
})
class TabsTestComponent {
    @ViewChild(IgxTabsComponent) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv') public wrapperDiv: any;

    public tabSelectedHandler(args) {
    }
}

@Component({
    template: `
        <div #wrapperDiv>
            <igx-tabs (onTabSelected)="tabSelectedHandler($event)">
                <igx-tabs-group *ngFor="let tab of collection" [label]="tab.name"></igx-tabs-group>
            </igx-tabs>
        </div>`
})
class TabsTest2Component {
    @ViewChild(IgxTabsComponent) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv') public wrapperDiv: any;
    public collection: any[];

    public tabSelectedHandler(args) {
    }

    public constructor() {
        this.resetCollectionThreeTabs();
    }
    public resetCollectionOneTab() {
        this.collection =
            [
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionTwoTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionThreeTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' }
            ];
    }
    public resetCollectionFourTabs() {
        this.collection =
            [
                { name: 'Tab 1' },
                { name: 'Tab 2' },
                { name: 'Tab 3' },
                { name: 'Tab 4' }
            ];
    }
    public resetToEmptyCollection() {
        this.collection = [];
    }
}

@Component({
    template: `
        <div #wrapperDiv>
        <igx-tabs tabsType="fixed">
            <igx-tabs-group label="Tab111111111111111111111111">
                <ng-template igxTab>
                    <div>T1</div>
                 </ng-template>
                 <h1>Tab 1 Content</h1>
              </igx-tabs-group>
            <igx-tabs-group label="Tab 2">
                <ng-template igxTab>
                    <div>T2</div>
                </ng-template>
                <h1>Tab 2 Content</h1>
            </igx-tabs-group>
            <igx-tabs-group label="Tab 3">
                <ng-template igxTab>
                    <div>T3</div>
                </ng-template>
                <h1>Tab 3 Content</h1>
            </igx-tabs-group>
        </igx-tabs>
        </div>`
})
class TemplatedTabsTestComponent {
    @ViewChild(IgxTabsComponent) public tabs: IgxTabsComponent;
    @ViewChild('wrapperDiv') public wrapperDiv: any;
}
