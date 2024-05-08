import { TrendingNoozService } from './trending-nooz.service';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import { ToastrService } from "src/app/services/toastr.service";
import { ToastrService } from 'ngx-toastr';
import { Meta, Title } from '@angular/platform-browser';
import { getCode, getName } from 'country-list';
import * as moment from 'moment';
import { MapService } from 'src/app/services/map.service';
import * as L from 'leaflet';
// import { antPath } from 'leaflet-ant-path';
import { Map, Polygon, Circle, Marker } from 'leaflet';

@Component({
  selector: 'app-trending-nooz',
  templateUrl: './trending-nooz.component.html',
  styleUrls: ['./trending-nooz.component.css'],
})
export class TrendingNoozComponent implements OnInit {
  @Input() referer!: any;
  trendingNoozShared: any = [];
  showSearch: boolean;
  safeSrc: SafeResourceUrl;
  blurb: string;
  city: string;
  country: string;
  story: string;
  TrendingNooz: any[] = [];
  isLoading: boolean = false;
  htmlSnippet: string;
  CreatedDate: string;
  pageNumber: number;
  pageSize: number;
  currentRoute: string;
  countryIndex: number;
  countryName: string;
  selectedCountryCode: string;

  TrendingNoozCol1: any[] = [];
  TrendingNoozCol2: any[] = [];
  TrendingNoozCol3: any[] = [];
  TrendingNoozCol4: any[] = [];

  // map: any;
  // private leafletService: MapService;
  // private map: Map;
  public message: string;
  private map: Map;
  private circle: Circle;
  private polygon: Polygon;
  private marker: Marker;

  constructor(
    private trendingNoozSvc: TrendingNoozService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private title: Title,
    private meta: Meta,
    private router: Router, 
    //private moment: Moment,
    private mapService: MapService,
  ) {
    // this.mapService = new MapService();
  }

  private setupMap() {
    // Create the map in the #map container
    // this.map = this.mapService.L.map('map').setView([51.505, -0.09], 13);
    this.map = this.mapService.L.map('map', {
      center: [39.3684121, -76.7991077],
      zoom: 11,
      editable: true
    });

    // Add a tilelayer
    this.mapService.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    /* this.marker = this.mapService.L.marker([51.5, -0.09]).addTo(this.map);

    this.circle = this.mapService.L.circle([51.508, -0.11], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 500
    }).addTo(this.map); */

    /* this.polygon = this.mapService.L.polygon([
      [51.509, -0.08],
      [51.503, -0.06],
      [51.51, -0.047]
    ]).addTo(this.map);

    this.marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup();
    this.circle.bindPopup('I am a circle.');
    this.polygon.bindPopup('I am a polygon.'); */
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    if (this.mapService.L) {
      // Leaflet is loaded - load the map!
      // this.message = 'Map Loaded';
      console.log('Map loaded');
      this.setupMap();
      /* this.map = this.mapService.L.map('map').setView([43.068661, 141.350755], 8);
      this.mapService.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map); */
    } else {
      // When the server renders it, it'll show this.
      // this.message = 'Map not loaded';
      console.log('Map not loaded');
    }
  }
  
  ngOnInit() {
    
    /* if (this.mapService.L) {
      // this.map = this.leafletService.L.map('map').setView([51.505, -0.09], 13);
      this.map = this.mapService.L.map('map').setView([43.068661, 141.350755], 8);
      this.mapService.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);
      // Makerを配置
      this.mapService.L.marker([0, 0]).bindPopup('<b>Hello!!</b>').addTo(this.map);
      antPath(
        [
          [43.068661, 141.350755],
          [42.768651, 141.750955],
        ],
        { color: '#FF0000', weight: 5, opacity: 0.6 }
      ).addTo(this.map);
      antPath(
        [
          [43.668661, 140.250755],
          [42.368651, 141.150955],
        ],
        { color: '#0000FF', weight: 5, opacity: 0.6, reverse: true }
      ).addTo(this.map);
    } */
    
    /* this.countryCodes = this.countryCodes.sort(function (a, b) {
      var textA = a.toUpperCase();
      var textB = b.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    }); */
    let countryCode;
    this.pageNumber = 1;
    this.pageSize = this.referer == 'home'?12: 50;
    // this.route.params.subscribe((params) => {
      this.GetTrendingNooz();
    // });
    // this.currentRoute = this.router.url.replace(countryCode, '');
    this.trendingNoozSvc.trendingNooz$.subscribe(msg => this.trendingNoozShared = msg);
    this.trendingNoozSvc.inSearch$.subscribe(msg => this.showSearch = msg);
    this.showSearch = false;
    this.trendingNoozSvc.updateInSearch(this.showSearch);

    this.meta.updateTag({
      property: 'og:type',
      content: 'video.other',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Noozter - Trending news, Breaking news, countrywide, Quickview of new, Current affairs, news, posts, latest news, latest posts, accumulated news, search countries',
    });
    this.meta.updateTag({
      property: 'og:site_name',
      content: 'Noozter - Home',
    });
    this.meta.updateTag({
      property: 'og:url',
      content: 'noozter.com',
    });
    this.meta.updateTag({
      name: 'description',
      content:
        "Trendnding worldwide, Breaking news, Current affairs, news, posts, latest news, latest posts, about what's happening around.",
    });
    this.meta.updateTag({
      name: 'keywords',
      content:
        "Breaking news, Quickview of new, Current affairs, news, posts, latest news, latest posts, accumulated news, search",
    });
  }


  async GetTrendingNooz() {
    // console.log(">>>>>>>>>", this.TrendingNooz);
    
    this.trendingNoozSvc
      .getTrendingNooz(this.pageNumber, this.pageSize)
      .subscribe(
        (data: any) => {
          this.isLoading = false;
          if (data.Items.length) {
            /* for (let i = 0; i < data.Items.length; i++){
              const image = data.Items[i].MediaUri;
              image.alt = `#${i}`;
              images.push(image);
            } */
            data.Items = data.Items.filter(o => o.Blurb.indexOf('Nooz') <= 0)
            data.Items.map(o => {
              let result = o.Blurb.lastIndexOf(".");
              if (result == -1) {
                result = o.Blurb.lastIndexOf("?");
              }
              if (result == -1) {
                result = o.Blurb.lastIndexOf(" ");
              }
              o.Blurb = o.Blurb.substring(0, result+1)
            })
            this.TrendingNooz = data.Items;

            let tempNoozHolder = data.Items;

            this.TrendingNoozCol1 = tempNoozHolder.splice(0,3);
            this.TrendingNoozCol2 = tempNoozHolder.splice(0,3);
            this.TrendingNoozCol3 = tempNoozHolder.splice(0,3);
            this.TrendingNoozCol4 = tempNoozHolder.splice(0,3);

            /* this.TrendingNoozCol1 = tempNoozHolder.splice(0,7);
            this.TrendingNoozCol2 = tempNoozHolder.splice(0,6);
            this.TrendingNoozCol3 = tempNoozHolder.splice(0,7);
            this.TrendingNoozCol4 = tempNoozHolder.splice(0,6); */

            this.trendingNoozSvc.TrendingNooz = data.Items;
            this.trendingNoozSvc.updateValue(this.TrendingNooz);
            // this.showSearch = true && this.referer != 'home';
            this.showSearch = false;
            this.trendingNoozSvc.updateInSearch(this.showSearch);
          }
        },
        (error) => {
          console.log("Error: ", error);
          this.toastr.error('Unable to fetch.');
          this.isLoading = false;
        },
        () => {
          //to keep mp4 video on top
          //this.NoozMedias = this.array_move(this.NoozMedias);
          if (!this.TrendingNooz.length && this.referer!='home') {
            this.toastr.info('No posts to show for the selected country.');
          }
          if (this.TrendingNooz.length && this.TrendingNooz.length < 50 && this.pageNumber > 1 && this.referer!='home') {
            this.toastr.info('No posts to show for the selected country.');
          }
          // console.log("api call finished");
        }
      );
  }

  GetCountryName(countryCode) {
    return getName(countryCode);
  }
  formatDate(d) {
    return moment(d).format('MMM DD, YYYY @hh:mm:ss a');
  }

  loadMore() {
    this.pageNumber += this.pageSize;
    this.isLoading = true;
    this.GetTrendingNooz();
  }
  loadPrev() {
    this.pageNumber -= this.pageSize;
    // console.log(this.pageNumber);
    this.isLoading = true;
    this.GetTrendingNooz();
  }
}
