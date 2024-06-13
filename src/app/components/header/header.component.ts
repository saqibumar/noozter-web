import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { AllNoozService } from '../all-nooz/all-nooz.service';
import { TrendingNoozService } from '../trending-nooz/trending-nooz.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { HttpClient, HttpBackend  } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { getCode, getName } from 'country-list';
import { GeoService } from '../../services/Geo.service';
import { DOCUMENT } from '@angular/common';
import { GeolocationService } from '../map/geolocation.service';
import { of } from 'rxjs';

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
  selectedCountry = '';
  selectedLang = '';
  selectedCountryCode = '';
  filterForm: FormGroup;
  filterInput = new FormControl('');
  isTyping: boolean;
  isTypingSubscription;
  
  showSearch: boolean;
  allNoozShared: any = [];
  countryFlagShared: any = '';
  previousFlagSelected: any = '';
  trendingNoozShared: any = [];
  private httpClient: HttpClient;

  private geoSvc: GeoService;

  constructor(private noozSvc: AllNoozService, 
    private trendingNoozSvc: TrendingNoozService, 
    httpBackend: HttpBackend, 
    private router: Router,
    private route: ActivatedRoute,
    private geolocationService: GeolocationService,
    private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {
    this.httpClient = new HttpClient(httpBackend);
    this.allNoozShared = [];
    this.trendingNoozShared = [];
    this.showSearch = false;
    this.geoSvc = new GeoService();
  }

  /* updateValue() {
    this.noozSvc.updateValue(this.noozSvc.AllNooz);
  } */

  async ngOnInit() {
    await this.getIPAddressAndGeoLocation();

    // Below extracts the country code from the url to be used for flag - https://ipgeolocation.io/static/flags/au_64.png
    let cc = this.countryCode;
    this.selectedLang = this.geoSvc.getLang(cc);
    // console.log(cc, this.selectedLang);

    const extracted_countryCode_url = this.router.url.split(/[/ ]+/).pop();
    // this.countryCode = extracted_countryCode_url;
    if (extracted_countryCode_url.length === 2)
      this.country_flag = this.country_flag.replace(this.countryCode.toLocaleLowerCase(), extracted_countryCode_url.toLocaleLowerCase());
   

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
    this.noozSvc.countryFlag$.subscribe(msg => {
      this.countryFlagShared = msg;
      if (this.countryFlagShared.length) {
        if (!this.countryCode) {
          this.country_flag = this.country_flag.replace(`${this.countryFlagShared.toLocaleLowerCase()}`, `${msg.toLocaleLowerCase()}`);
        } else {
          // console.log('2flag', this.country_flag, '>>>', this.countryCode, this.countryFlagShared, msg, this.previousFlagSelected)
          this.country_flag = this.country_flag.replace(`${this.previousFlagSelected.toLocaleLowerCase() || this.countryCode.toLocaleLowerCase()}.png`, `${msg.toLocaleLowerCase()}.png`);
          this.previousFlagSelected = msg.toLocaleLowerCase();
        }
        // this.countryCode = msg;
        this.selectedCountryCode = msg;
        // this.selectedCountry = this.geoSvc.getName(this.selectedCountryCode);
        this.selectedCountry = getName(this.selectedCountryCode);
        this.selectedLang = this.geoSvc.getLang(this.selectedCountryCode);
      }
      return this.countryFlagShared = msg
    });

    setTimeout(() => {
      let htmlElement = this.document.querySelector('html');
      this.renderer.setAttribute(htmlElement, 'lang', this.selectedLang);
    }, 0);

    this.trendingNoozSvc.trendingNooz$.subscribe(msg => this.trendingNoozShared = msg);
    this.trendingNoozSvc.inSearch$.subscribe(msg => this.showSearch = msg);

    this.showSearch = false;
    this.noozSvc.updateInSearch(this.showSearch);

    this.trendingNoozSvc.updateInSearch(this.showSearch);

    //if (this.countryFlagShared.length) {
      // console.log(this.countryFlagShared, this.noozSvc.countryFlag$)
      //this.country_flag = this.country_flag.replace(this.countryCode.toLocaleLowerCase(), this.countryFlagShared.toLocaleLowerCase());
    // }

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

  async getIPAddressAndGeoLocation()
  {
    const promise = new Promise((resolve, reject) => {
      this.geolocationService.detectIP().subscribe(async(res:any) => {
      // this.httpClient.get("https://api.ipify.org/?format=json").subscribe(async (res:any) => {
        this.ipAddress = res.ip;
        await this.getGeoLocation(this.ipAddress);
        resolve(true);
        // return this.ipAddress;
      });
    });
    return promise;
  }

  async getGeoLocation2(ip: string)
  {
    const promise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return;
      let hasIPChanged:boolean = false;
      let res: any = window.localStorage.getItem('geo')
      res = JSON.parse(res);
  
      let localStorageIPAddress: any = window.localStorage.getItem('IPAddress');
  
      if (localStorageIPAddress !== this.ipAddress) {
        window.localStorage.setItem('IPAddress', this.ipAddress);
        hasIPChanged = true;
      }
  
      if (res && !hasIPChanged) {
        this.country = res.country_name;
        this.city = res.city;
        this.countryCode = res.country_code2;
        this.regionName = res.city;
        this.lat = res.latitude;
        this.lon = res.longitude;
        this.country_flag = res.country_flag;
        resolve(res);
      } else {
        // e341bebc49334ad29b0ed2e363d6f537
        // this.httpClient.get(`http://ip-api.com/json/${ip}`).subscribe((res:any)=>{
        this.httpClient.get(`https://api.ipgeolocation.io/ipgeo?apiKey=e341bebc49334ad29b0ed2e363d6f537&ip=${ip}`)
        .pipe(
          catchError((error) => {
            console.error('Error occurred while fetching geolocation data:', error);
            this.getGeoLocation(ip)
            // Handle the error as needed, for example, return a default value
            return of(null);
          })
        ).subscribe((res:any) => {
          console.log(res)
          if (res) {
            window.localStorage.setItem('geo', JSON.stringify(res));
            this.country = res.country_name;
            this.city = res.city;
            this.countryCode = res.country_code2;
            this.regionName = res.city;
            this.lat = res.latitude;
            this.lon = res.longitude;
            this.country_flag = res.country_flag;
          } else {
            console.warn('Geolocation data is not available.', this.countryCode);
            // this.getAltGeoLocation(ip)
          }

          resolve(res);
  
        })
      }
    });
    return promise;
  }

  async getGeoLocation(ip: string) {
    const promise = new Promise((resolve, reject) => {

      if (typeof window === 'undefined') return;
      let hasIPChanged:boolean = false;
      let res: any = window.localStorage.getItem('geo-maxmind')
      res = JSON.parse(res);
  
      let localStorageIPAddress: any = window.localStorage.getItem('IPAddress');
  
      if (localStorageIPAddress !== this.ipAddress) {
        window.localStorage.setItem('IPAddress', this.ipAddress);
        hasIPChanged = true;
      }
  
      if (res && !hasIPChanged) {
        this.country = res.city.Country.Name;
        this.regionName = res.city.Subdivisions[0].Name;
        this.lat = res.city.Location.Latitude;
        this.lon = res.city.Location.Longitude;
        this.city = `${res.city.City.Names.en}` || null;
        this.countryCode = res.city.Country.IsoCode;
        this.country_flag = `../../../assets/flags/png100px/${this.countryCode.toLowerCase()}.png`;
        resolve(res);
      } else {
        this.geolocationService.ip2Location(ip).subscribe((res:any) => {
          if (!res.success) {
            reject(res);
            //throw new Error(res.message);
          } else {
            this.country = res.city.Country.Name;
            this.regionName = res.city.Subdivisions[0].Name;
            this.lat = res.city.Location.Latitude;
            this.lon = res.city.Location.Longitude;
            
            this.city = `${res.city.City.Names.en}` || null;
            this.countryCode = res.city.Country.IsoCode;
            this.country_flag = `../../../assets/flags/png100px/${this.countryCode.toLowerCase()}.png`;
            console.log(this.country_flag);
            resolve(res);
          }
        });
      }

    });
    return promise;
  }

  GetCountryName(countryCode) {
    return this.geoSvc.getName(countryCode);
    //return getName(countryCode);
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