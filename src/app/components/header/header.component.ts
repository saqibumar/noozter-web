import { Component, OnInit } from '@angular/core';
import { AllNoozService } from '../all-nooz/all-nooz.service';
import { TrendingNoozService } from '../trending-nooz/trending-nooz.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { HttpClient, HttpBackend  } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  ipAddress = '';
  regionName = '';
  city = '';
  country = '';
  countryCode = '';
  country_flag = '';
  lat = '';
  lon = '';
  filterForm: FormGroup;
  filterInput = new FormControl('');
  isTyping: boolean;
  isTypingSubscription;
  
  showSearch: boolean;
  allNoozShared: any = [];
  trendingNoozShared: any = [];
  private httpClient: HttpClient;

  constructor(private noozSvc: AllNoozService, 
    private trendingNoozSvc: TrendingNoozService, 
    httpBackend: HttpBackend, 
    private router: Router,
    private route: ActivatedRoute) {
    this.httpClient = new HttpClient(httpBackend);
    this.allNoozShared = [];
    this.trendingNoozShared = [];
    this.showSearch = false;
  }

  /* updateValue() {
    this.noozSvc.updateValue(this.noozSvc.AllNooz);
  } */

  async ngOnInit() {
    await this.getIPAddress();
    await this.getGeoLocation(this.ipAddress);

    // Below extracts the country code from the url to be used for flag - https://ipgeolocation.io/static/flags/au_64.png
    /* this.route.params.subscribe((params) => {
      console.log(params);
    });

    let cc = this.countryCode;
    console.log(this.router.url);
    const extracted_countryCode_url = this.router.url.split(/[/ ]+/).pop();
    console.log(extracted_countryCode_url)
    // this.countryCode = extracted_countryCode_url;
    if (extracted_countryCode_url.length === 2)
      this.country_flag = this.country_flag.replace(this.countryCode.toLocaleLowerCase(), extracted_countryCode_url.toLocaleLowerCase()); */

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

  getIPAddress()
  {
    this.httpClient.get("https://api.ipify.org/?format=json").subscribe((res:any)=>{
      this.ipAddress = res.ip;
      return this.ipAddress;
    });
  }

  getGeoLocation(ip: string)
  {
    if (typeof window === 'undefined') return;
    let res: any = window.localStorage.getItem('geo')
    res = JSON.parse(res);
    console.log(res);
    if (res) {
      this.country = res.country_name;
      this.city = res.city;
      this.countryCode = res.country_code2;
      this.regionName = res.city;
      this.lat = res.latitude;
      this.lon = res.longitude;
      this.country_flag = res.country_flag;
      
    } else {
      // e341bebc49334ad29b0ed2e363d6f537
      // this.httpClient.get(`http://ip-api.com/json/${ip}`).subscribe((res:any)=>{
        this.httpClient.get(`https://api.ipgeolocation.io/ipgeo?apiKey=e341bebc49334ad29b0ed2e363d6f537&ip=${ip}`).subscribe((res:any) => {
        window.localStorage.setItem('geo', JSON.stringify(res));
        this.country = res.country_name;
        this.city = res.city;
        this.countryCode = res.country_code2;
        this.regionName = res.city;
        this.lat = res.latitude;
        this.lon = res.longitude;
        this.country_flag = res.country_flag;
      });
    }
  }


}

export interface GeoInfo {
  country_name: string;
  city: string;
  country_code2: string;
  latitude: string;
  longitude: string;
  country_flag: string;
}