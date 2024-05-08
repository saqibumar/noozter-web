import { AllNoozService } from './all-nooz.service';
import { Component, Inject, Input, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import { ToastrService } from "src/app/services/toastr.service";
import { ToastrService } from 'ngx-toastr';
import { Meta, Title } from '@angular/platform-browser';
import { getCode, getName } from 'country-list';
import * as moment from 'moment';
import { DOCUMENT } from '@angular/common';
import { GeoService } from 'src/app/services/Geo.service';

@Component({
  selector: 'app-all-nooz',
  templateUrl: './all-nooz.component.html',
  styleUrls: ['./all-nooz.component.css'],
})
export class AllNoozComponent implements OnInit {
  @Input() referer!: any;
  allNoozShared: any = [];
  showSearch: boolean;
  
  private geoSvc: GeoService;
  constructor(
    private noozSvc: AllNoozService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private title: Title,
    private meta: Meta,
    private router: Router, //private moment: Moment
    private renderer: Renderer2, @Inject(DOCUMENT) private document: Document
  ) {
    this.geoSvc = new GeoService();
    
  }

  safeSrc: SafeResourceUrl;
  blurb: string;
  city: string;
  country: string;
  story: string;
  AllNooz: any[] = [];
  isLoading: boolean = false;
  htmlSnippet: string;
  CreatedDate: string;
  pageNumber: number;
  pageSize: number;
  currentRoute: string;
  countryCodes: string[] = [
    'LY',
    'BR',
    'US',
    'CO',
    'LB',
    'FR',
    'CR',
    'AU',
    'RU',
    'MX',
    'PK',
    'JP',
    'TH',
    'CH',
    'ES',
    'OM',
    'CA',
    'IE',
    'AE',
    'UK',
    'TR',
    'CN',
    'IT',
    'SA',
    'GB',
    'IN',
    'IL',
    'PS',
    'UA',
  ];
  countryIndex: number;
  countryName: string;
  selectedCountryCode: string;
  selectedLang = '';

  ngOnInit() {
    this.countryCodes = this.countryCodes.sort(function (a, b) {
      var textA = a.toUpperCase();
      var textB = b.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
    //console.log(this.countryCodes);
    let countryCode;
    this.route.params.subscribe((params) => {
      //console.log(params);
      // console.log(this.router.url, window.location.pathname);
      countryCode = params.countryCode;
      
      this.pageNumber = 1;
      this.pageSize = 50;
      if (countryCode) {
        this.selectedLang = this.geoSvc.getLang(countryCode);
        setTimeout(() => {
          let htmlElement = this.document.querySelector('html');
          this.renderer.setAttribute(htmlElement, 'lang', this.selectedLang);
        }, 0);

        this.noozSvc.updateCountryCode(countryCode);
        this.selectedCountryCode = countryCode;
        this.isLoading = true;
        this.GetSelectedCountryNooz(countryCode);
      } else if (params.lat && params.lon) {
        this.isLoading = true;
        this.GetLocalNooz(params.lat, params.lon);
      } else {
          this.noozSvc.updateValue([]);
          // this.showSearch = false;
          // this.noozSvc.updateInSearch(this.showSearch);
      }
      const index = this.countryCodes.indexOf(countryCode, 0);
      this.countryIndex = index;
      /* if (index > -1) {
        this.countryCodes.splice(index, 1);
      }
       */
      // console.log(getName(countryCode));
    });
    this.currentRoute = this.router.url.replace(countryCode, '');
    this.noozSvc.allNooz$.subscribe(msg => this.allNoozShared = msg);
    this.noozSvc.inSearch$.subscribe(msg => this.showSearch = msg);
    this.showSearch = false;
    this.noozSvc.updateInSearch(this.showSearch);
    this.meta.updateTag({
      property: 'og:type',
      content: 'video.other',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Noozter - Worldwide trending news, Breaking news, countrywide, Quickview of new, Current affairs, news, posts, latest news, latest posts, accumulated news, search countries',
    });
    this.meta.updateTag({
      property: 'og:site_name',
      content: 'Noozter - Worldwide',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: 'noozter.com',
    });
    this.meta.updateTag({
      name: 'description',
      content:
        "Select country news, Current affairs, news, posts, latest news, latest posts, about what's happening around countries",
    });
    this.meta.updateTag({
      name: 'keywords',
      content:
        "Breaking news, countrywide, Quickview of new, Current affairs, news, posts, latest news, latest posts, accumulated news, search countries",
    });
  }

  GetLocalNooz(lat, lon) {
    // console.log(">>>>>>>>>", this.AllNooz);
    
    this.noozSvc
      .getCityNooz(lat, lon, this.pageNumber, this.pageSize)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          data.Items = data.Items.filter(o => o.Blurb.indexOf('Nooz') <= 0)
          data.Items.map(o => {
            //console.log(o.Blurb)
            let result = o.Blurb.lastIndexOf(".");
            if (result == -1) {
              result = o.Blurb.lastIndexOf("?");
            }
            if (result == -1) {
              result = o.Blurb.lastIndexOf(" ");
            }
            o.Blurb = o.Blurb.substring(0, result+1)
          })
          this.AllNooz = data.Items;
          this.noozSvc.AllNooz = data.Items;
          this.noozSvc.updateValue(this.AllNooz);
          this.showSearch = true;
          this.noozSvc.updateInSearch(this.showSearch);
        },
        (error) => {
          //console.log("Error: ", error);
          this.toastr.error('Unable to fetch.');
          this.isLoading = false;
        },
        () => {
          //to keep mp4 video on top
          //this.NoozMedias = this.array_move(this.NoozMedias);
          if (this.AllNooz.length && this.AllNooz.length < 50 && this.pageNumber > 1) {
            this.toastr.info('No posts to show for the selected country');
          }
          // console.log("api call finished");
        }
      );
  }

  GetSelectedCountryNooz(countryCode) {
    // console.log(">>>>>>>>>", this.AllNooz);
    
    this.noozSvc
      .getAllNooz(countryCode, this.pageNumber, this.pageSize)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          data.Items = data.Items.filter(o => o.Blurb.indexOf('Nooz') <= 0)
          data.Items.map(o => {
            // console.log(o.Blurb)
            let result = o.Blurb.lastIndexOf(".");
            if (result == -1) {
              result = o.Blurb.lastIndexOf("?");
            }
            if (result == -1) {
              result = o.Blurb.lastIndexOf(" ");
            }
            o.Blurb = o.Blurb.substring(0, result+1)
          })
          this.AllNooz = data.Items;
          this.noozSvc.AllNooz = data.Items;
          this.noozSvc.updateValue(this.AllNooz);
          this.showSearch = true;
          this.noozSvc.updateInSearch(this.showSearch);
        },
        (error) => {
          //console.log("Error: ", error);
          this.toastr.error('Unable to fetch.');
          this.isLoading = false;
        },
        () => {
          //to keep mp4 video on top
          //this.NoozMedias = this.array_move(this.NoozMedias);
          if (this.AllNooz.length && this.AllNooz.length < 50 && this.pageNumber > 1) {
            this.toastr.info('No posts to show for the selected country.');
          }
          // console.log("api call finished");
        }
      );
  }

  GetCountryName(countryCode) {
    return this.geoSvc.getName(countryCode);
    //return getName(countryCode);
  }
  formatDate(d) {
    return moment(d).format('MMM DD, YYYY @hh:mm:ss a');
  }

  loadMore() {
    this.pageNumber += this.pageSize;
    this.isLoading = true;
    this.GetSelectedCountryNooz(this.selectedCountryCode);
  }
  loadPrev() {
    this.pageNumber -= this.pageSize;
    // console.log(this.pageNumber);
    this.isLoading = true;
    this.GetSelectedCountryNooz(this.selectedCountryCode);
  }
}
