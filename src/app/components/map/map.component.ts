import { AfterViewInit, Component, Input } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';
import { MapService } from 'src/app/services/map.service';
import { HttpBackend, HttpClient } from '@angular/common/http';
// import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
    @Input() referer!: any;
    ipAddress = '';
    regionName = '';
    city = '';
    country = '';
    countryCode = '';
    country_flag = '';
    lat = '';
    lon = '';
    coordsFromIP = false;
    selectedCountry = '';
    selectedLang = '';
    selectedCountryCode = '';
    isTyping: boolean;
    isTypingSubscription;
    
    showSearch: boolean;
    allNoozShared: any = [];
    countryFlagShared: any = '';
    trendingNoozShared: any = [];
    private httpClient: HttpClient;

  map: any;

  constructor(
    private mapService: MapService,
    httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(httpBackend);
  }

  public ngAfterViewInit(): void {
    if (this.mapService.L) {
        this.getIPAddressAndGeoLocation().then(async (data) => {
            this.getGeoLocation(this.ipAddress).then((response) => {
                this.loadMap();
            });
            /* if (this.mapService.L) {
                this.loadMap();
            } */
        });
    }
  }

  private getCurrentPosition(): any {
      return new Observable((observer: Subscriber<any>) => {
        this.coordsFromIP = false;
        var lat, lon;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position: any) => {
            observer.next({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            observer.complete();
            },
            (error: GeolocationPositionError) => {
                // console.log(error);
                this.coordsFromIP = true;
                observer.next({
                    latitude: this.lat,
                    longitude: this.lon,
                });
                observer.complete();
            });
        } else {
            observer.error();
        }
    });
  }

  getIPAddressAndGeoLocation()
  {
    const promise = new Promise((resolve, reject) => {
        this.httpClient.get("https://api.ipify.org/?format=json").subscribe((res:any) => {
            this.ipAddress = res.ip;
            resolve(res)
        });
      });
  
      return promise;
  }

  getGeoLocation(ip: string)
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
            this.httpClient.get(`https://api.ipgeolocation.io/ipgeo?apiKey=e341bebc49334ad29b0ed2e363d6f537&ip=${ip}`).subscribe((res:any) => {
                window.localStorage.setItem('geo', JSON.stringify(res));
                this.country = res.country_name;
                this.city = res.city;
                this.countryCode = res.country_code2;
                this.regionName = res.city;
                this.lat = res.latitude;
                this.lon = res.longitude;
                this.country_flag = res.country_flag;
                resolve(res);
            });
        }
      });
  
      return promise;
  }

  private loadMap(): void {
    this.map = this.mapService.L.map('map').setView([this.lat, this.lon], 1);
    this.mapService.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    //   id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
    //   accessToken: environment.mapbox.accessToken,
    }).addTo(this.map);

    this.getCurrentPosition()
    .subscribe((position: any) => {
      this.map.flyTo([position.latitude, position.longitude], 13);

      const icon = this.mapService.L.icon({
        iconUrl: 'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-icon.png',
        shadowUrl: 'https://res.cloudinary.com/rodrigokamada/image/upload/v1637581626/Blog/angular-leaflet/marker-shadow.png',
        popupAnchor: [13, 0],
      });

      const marker = this.mapService.L.marker([position.latitude, position.longitude], { icon }).bindPopup(!this.coordsFromIP?'Your location!': 'Your estimated location');
      marker.addTo(this.map);
    });
  }

}
