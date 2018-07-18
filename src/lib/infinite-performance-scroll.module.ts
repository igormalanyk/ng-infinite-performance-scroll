import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfinitePerformanceScrollComponent } from './components/infinite-performance-scroll.component';
import { InfinitePerformanceScrollBottomDirective } from './infinite-performance-scroll.directive';

const exports = [
  InfinitePerformanceScrollComponent,
  InfinitePerformanceScrollBottomDirective
];

@NgModule({
  imports: [CommonModule],
  declarations: exports,
  exports
})
export class InfinitePerformanceScrollModule {
}
