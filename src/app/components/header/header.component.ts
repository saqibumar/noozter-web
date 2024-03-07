import { Component, OnInit } from '@angular/core';
import { AllNoozService } from '../all-nooz/all-nooz.service';
import { TrendingNoozService } from '../trending-nooz/trending-nooz.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  filterForm: FormGroup;
  filterInput = new FormControl('');
  isTyping: boolean;
  isTypingSubscription;
  
  showSearch: boolean;
  allNoozShared: any = [];
  trendingNoozShared: any = [];

  constructor(private noozSvc: AllNoozService, private trendingNoozSvc: TrendingNoozService) {
    this.allNoozShared = [];
    this.trendingNoozShared = [];
    this.showSearch = false;
  }

  /* updateValue() {
    this.noozSvc.updateValue(this.noozSvc.AllNooz);
  } */

  ngOnInit() {
    this.filterForm = new FormGroup({
      filterInput: new FormControl(null,[Validators.required])
    });

    this.isTypingSubscription = this.filterForm.controls.filterInput.valueChanges
      .pipe(
        tap(()=>this.isTyping = true),
        debounceTime(600),
        distinctUntilChanged(),
        )
        .subscribe(value => {
          this.filterNooz(value);
          // console.log(value);
          this.isTyping = false;
        });

    this.noozSvc.allNooz$.subscribe(msg => this.allNoozShared = msg);
    this.noozSvc.inSearch$.subscribe(msg => this.showSearch = msg);

    this.trendingNoozSvc.trendingNooz$.subscribe(msg => this.trendingNoozShared = msg);
    this.trendingNoozSvc.inSearch$.subscribe(msg => this.showSearch = msg);

    this.showSearch = false;
    this.noozSvc.updateInSearch(this.showSearch);

    this.trendingNoozSvc.updateInSearch(this.showSearch)

  }

  filterNooz(inp: string) {
    // this.filterInput.setValue('SAQIB')

    // console.log(inp, '>>>>>>>>', this.noozSvc.AllNooz)
    if (this.noozSvc.AllNooz) {
      this.noozSvc.getFiltered(this.noozSvc.AllNooz, inp);
      this.showSearch = true;
      this.noozSvc.updateInSearch(this.showSearch)
    }
    if (this.trendingNoozSvc.TrendingNooz) {
      this.trendingNoozSvc.getFiltered(this.trendingNoozSvc.TrendingNooz, inp);
      this.showSearch = true;
      this.trendingNoozSvc.updateInSearch(this.showSearch)
    }

  }


}
