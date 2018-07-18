import {
  ChangeDetectionStrategy,
  Component, ContentChild, ElementRef, EventEmitter, HostListener, Input,
  OnChanges, Output, Renderer2, SimpleChanges, TemplateRef, ViewChild
} from '@angular/core';
import { NodeHelper } from '../node.helper';

@Component({
  selector: 'infinite-performance-scroll',
  templateUrl: './infinite-performance-scroll.component.html',
  styles: [`
    .space {width:100%;}
    :host, :host * {
      overflow-anchor:none;
    }
    :host {
      align-content:flex-start;
      display: -ms-flexbox;
      display: flex;
      -ms-flex-wrap:wrap;
      flex-wrap:wrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfinitePerformanceScrollComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() nextPageOffset = 300;
  @Input() scrollWindow = true;

  @Output() loadNextPage = new EventEmitter<boolean>();

  @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;
  @ViewChild('top', {read: ElementRef}) top: ElementRef;
  @ViewChild('bottom', {read: ElementRef}) bottom: ElementRef;

  public startIndex = 0;
  public endIndex = this.data.length;

  private isReachBottom = false;
  private elementTopCache: number[] = [];

  private eventTimeout: any = null;

  private innerHeight = 0;
  private scrollContainer: any = null;
  private itemsContainer: any = null;

  constructor(
    private renderer: Renderer2,
    private hostRef: ElementRef
  ) {
    this.itemsContainer = hostRef.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['scrollWindow']) {
      if (changes['scrollWindow'].currentValue) {
        this.scrollContainer = document.scrollingElement || document.documentElement;
        this.innerHeight = window.innerHeight;
      } else {
        this.scrollContainer = this.itemsContainer;
        this.innerHeight = this.itemsContainer.clientHeight;
      }
    }

    if (!!changes['data']) {
      this.calculateScroll();
    }
  }

  public itemContext = (item: any): any => ({$implicit: item});

  @HostListener('window:scroll')
  public windowScrollHandler() {
    if (this.scrollWindow) {
      this._scrollHandler();
    }
  }

  @HostListener('scroll')
  public elementScrollHandler() {
    if (!this.scrollWindow) {
      this._scrollHandler();
    }
  }

  private _scrollHandler() {
    this.calculateScroll();

    if (this.isBottomOfPage()) {
      if (!this.isReachBottom) {
        this.eventTimeout = NodeHelper.execWithDelay(this.eventTimeout, () => this.loadNextPage.emit());
      }
      this.isReachBottom = true;
    } else {
      this.isReachBottom = false;
    }
  }

  private calculateScroll(): void {
    const scrollPosition = this.scrollContainer.scrollTop;

    let startIndex = -1;
    let endIndex = this.data.length;

    NodeHelper.nodeListFilter(this.itemsContainer.childNodes, 'space')
      .forEach(({ offsetTop }, i) => this.elementTopCache[this.startIndex + i] = offsetTop);

    const cacheSize = this.elementTopCache.length;

    for (let i = 1; i < cacheSize; i++) {
      if (startIndex === -1) {
        if (scrollPosition < this.elementTopCache[i]) {
          startIndex = i - 1;
        }
      }

      if ((scrollPosition + this.innerHeight) < this.elementTopCache[i]) {
        endIndex = i;
        break;
      }
    }

    if (this.startIndex !== startIndex || this.endIndex !== endIndex) {
      this.startIndex = startIndex === -1 ? 0 : startIndex;
      this.endIndex = endIndex;

      this.changeSpaceHeight(
        this.elementTopCache[this.startIndex],
        this.endIndex === this.data.length ? 0 : this.scrollContainer.scrollHeight - this.elementTopCache[this.endIndex]
      );
    }
  }

  private isBottomOfPage(): boolean {
    const bottomScroll = this.scrollContainer.scrollTop + this.innerHeight;
    return (this.scrollContainer.scrollHeight - bottomScroll) < this.nextPageOffset;
  }

  private changeSpaceHeight(topOffset: number, bottomOffset: number): void {
    this.renderer.setStyle(this.top.nativeElement,    'height', `${topOffset}px`);
    this.renderer.setStyle(this.bottom.nativeElement, 'height', `${bottomOffset}px`);
  }
}
