import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import { HighlightPipe } from './autocomplete/highlight-pipe.pipe';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [ AutocompleteComponent, HighlightPipe],
  exports: [ AutocompleteComponent, HighlightPipe]
})
export class AutocompleteLibModule {
}