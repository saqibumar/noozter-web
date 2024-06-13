import { AfterViewInit, Component, Input, VERSION } from '@angular/core';
import { Observable, Subscriber, of } from 'rxjs';
import * as L from 'leaflet';
import { MapService } from 'src/app/services/map.service';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { GeoService } from 'src/app/services/Geo.service';
// import { environment } from 'src/environments/environment';
import { GeolocationService } from './geolocation.service';
import { Meta, Title } from '@angular/platform-browser';
import { AllNoozService } from '../all-nooz/all-nooz.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
    // title = "Find places using angular version " + VERSION.major;
    title = "Find places. Click on map to reveal info.";
    keyword = "display_name";
    loadingMapResults = false;
    public mapPlaces = [
      /* { id: 1, name: "Twiyo" },
      { id: 2, name: "Demimbu" },
      { id: 3, name: "Jaxworks" },
      { id: 4, name: "Skajo" },
      { id: 5, name: "Shufflebeat" }, */
    ];

    @Input() mapReferer!: any;
    ipAddress = '';
    regionName = '';
    city = '';
    country = '';
    countryCode = '';
    country_flag = '';
    lat = '';
    lon = '';
    coordsFromIP = true;
    popup;
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
  marker: any;

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
  paramCountry: any;

  location: { latitude: number, longitude: number } | null = null;
  error: string | null = null;
  permissionDenied: boolean = false;

  permissionStatus: string;
  watchId: number;

  private geoSvc: GeoService;
  constructor(
    private meta: Meta,
    private noozSvc: AllNoozService,
    private mapService: MapService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    httpBackend: HttpBackend,
    private geolocationService: GeolocationService) {
      this.httpClient = new HttpClient(httpBackend);
      if (!this.geoSvc) this.geoSvc = new GeoService();
  }

  ngOnInit() {
    this.getCurrentPosition();
    this.route.params.subscribe((params) => {
      this.CreateSEOMetaTags(params);
    });
    // this.checkGeolocationPermission();
  }

  ngOnDestroy(): void {
    if (this.watchId != null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  CreateSEOMetaTags (params) {
    let placeString = "Around me";
    this.selectedCountryCode = params.countryCode;
    if (params.countryCode) {
      this.noozSvc.updateCountryCode(params.countryCode);
      placeString = this.GetCountryName(this.selectedCountryCode)
    }
    this.meta.updateTag({
      property: 'og:type',
      content: 'video.other',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: `Noozter - About ${placeString}, interactive map, IP to location map, trending events, countrywide, Quickview map, Current affairs, events, latest events, latest posts, search countries`,
    });
    this.meta.updateTag({
      property: 'og:site_name',
      content: 'Noozter - ' + placeString,
    });
    this.meta.updateTag({
      property: 'og:url',
      content: 'noozter.com',
    });
    this.meta.updateTag({
      name: 'description',
      content:
        "Select city to find events, Current affairs, posts, latest posts, about what's happening around your city",
    });
    this.meta.updateTag({
      name: 'keywords',
      content:
        "Event in " + placeString + ", countrywide, Quickview maps, Current affairs, posts, latest events, latest posts, search countries, search city, explore area using interactive map",
    });
  }

  //////////////////////////////////
  checkGeolocationPermission(): void {
    if (typeof navigator === 'undefined') return;
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        this.permissionStatus = result.state;
        this.handlePermissionChange(result.state);

        // Listen for permission changes
        result.onchange = () => {
          this.permissionStatus = result.state;
          this.handlePermissionChange(result.state);
        };
      });
    } else {
      // Permissions API is not supported, fallback to geolocation check
      this.getLocationUpdates();
    }
  }

  handlePermissionChange(status: string): void {
    switch (status) {
      case 'granted':
      case 'prompt':
        this.getLocationUpdates();
        break;
      case 'denied':
        this.showPermissionDeniedMessage();
        break;
    }
  }

  getLocationUpdates(): void {
    if (this.watchId != null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Latitude:', position.coords.latitude);
        console.log('Longitude:', position.coords.longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.showPermissionDeniedMessage();
        } else {
          console.error('Error getting location:', error);
        }
      }
    );
  }
  getLocation(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Latitude:', position.coords.latitude);
        console.log('Longitude:', position.coords.longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.showPermissionDeniedMessage();
        } else {
          console.error('Error getting location:', error);
        }
      }
    );
  }

  showPermissionDeniedMessage(): void {
    this.toastr.warning('Location permission is denied. Please enable it in your browser settings.');
  }
  /////////////////////////////////


  txtInputIP = '';

  updateIPAddressInput(val) {
    this.txtInputIP = val;
  }
    
  selectEvent(item) {
    // do something with selected item
    this.gotoSearchedPlace(item);
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
    this.loadingMapResults = true;
    this.searchPlace(val).then((data) => {
      this.loadingMapResults = false;
    });
  }

  onFocused(e) {
    // do something when input is focused
  }

  public ngAfterViewInit(): void {
    if (this.mapService.L) {
        this.getIPAddressAndGeoLocation().then(async (data) => {
            this.getGeoLocation(this.ipAddress).then((response) => {
                this.loadMap();
                this.selectLocation();
            });
            /* if (this.mapService.L) {
                this.loadMap();
            } */
        });
        this.countryCodes = this.countryCodes.sort(function (a, b) {
          var textA = a.toUpperCase();
          var textB = b.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
        let countryCode;
        this.route.params.subscribe((params) => {
          countryCode = params.countryCode;
          if (countryCode) {
            this.paramCountry = this.GetCountryName(countryCode);
            setTimeout(async () => {
              // this.onChangeSearch(this.paramCountry);
              this.searchPlace(this.paramCountry).then((res) => {
                if (res) {
                  this.selectEvent(res[0]);
                  this.loadingMapResults = false;
                }
              });
            });
          }
        });
    }
  }

  GetCountryName(countryCode) {
    return this.geoSvc.getName(countryCode);
    //return getName(countryCode);
  }

  private getCurrentPositionByIPAddress(): any {
    return new Observable((observer: Subscriber<any>) => {
      // console.log(error);
      observer.next({
          latitude: this.lat,
          longitude: this.lon,
      });
      observer.complete();
         
  });
}

  private getCurrentPosition(): any {
      return new Observable((observer: Subscriber<any>) => {
        var lat, lon;
        if (!navigator.geolocation) {
          this.toastr.warning("Geolocation is not supported by your browser");
        }
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position: any) => {
            observer.next({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            window.localStorage.setItem('geolocation-allowed', JSON.stringify({lat, lon}));
            this.coordsFromIP = false;
            this.popup = this.mapService.L.popup().setContent('<strong>You!</strong>');
            this.marker.name = 'userGeoMarker'
            observer.complete();
            },
            // (error: GeolocationPositionError) => {
            (error: any) => {
              this.permissionDenied = true;
              // console.log(error);
              this.toastr.warning('Location permission is denied. Please enable it in your browser settings.');
              this.coordsFromIP = true;
              this.popup = this.mapService.L.popup().setContent('<span style="color:red;">Your estimated location</span>');

              observer.next({
                  latitude: this.lat,
                  longitude: this.lon,
              });
              window.localStorage.setItem('geolocation-allowed', null);
              this.coordsFromIP = true;
              this.popup = this.mapService.L.popup().setContent('<span style="color:red;">Your estimated location</span>');

              this.marker.name = 'userIPMarker'
              observer.complete();

              // this.requestLocation();
            });
        } else {
          window.localStorage.setItem('geolocation-allowed', null);
          this.coordsFromIP = true;
          this.popup = this.mapService.L.popup().setContent('<span style="color:red;">Your estimated location</span>');

          observer.error();
        }
    });
  }

  getIPAddressAndGeoLocation()
  {
    const promise = new Promise((resolve, reject) => {
        // this.httpClient.get("https://api.ipify.org/?format=json").subscribe((res:any) => {
          this.geolocationService.detectIP().subscribe((res:any) => {
            this.ipAddress = res.ip;
            resolve(res)
        });
      });
  
      return promise;
  }

  ValidateIPaddress(ipaddress) { 

    var ipv6 = ipaddress;

    var ipv6_pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
    
        
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
      return (true)
    } else if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(ipv6)) {
      return (true)
    }
    this.toastr.error("You have entered an invalid IP address!")  
    return (false)  
  }  

  getMaxMindGeoLocation(ip: string)
  {
    if (!this.ValidateIPaddress(ip)) return;
    const promise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return;

      this.loadingMapResults = true;
      
      
      // this.httpClient.post(`/api/v1/ip2location`, {ip}).subscribe((res:any) => {
      // this.geolocationService.ip2Location(ip).then((res:any) => {
      this.geolocationService.ip2Location(ip).subscribe((res:any) => {
        if (!res.success) {
          reject(res);
          //throw new Error(res.message);
        } else {
          this.city = `${res.city.City.Names.en}` || null;
          if (this.city && this.city != 'undefined') this.city = `${this.city}, ${res.city.City.Subdivisions?res.city.City.Subdivisions[0].Names.en: ''}`;
          // window.localStorage.setItem('geo-maxmind', JSON.stringify(res));
          // if (this.city && this.city != 'undefined') 
          {
            let url = `https://nominatim.openstreetmap.org/reverse.php?lat=${res.city.Location.Latitude}&lon=${res.city.Location.Longitude}&zoom=14&format=jsonv2`;
            this.httpClient.get(url).subscribe((response:any) => {
              if (response) {
                const icon = this.mapService.L.icon({
                  iconUrl: '../../../assets/marker-icon.png',
                  shadowUrl: '../../../assets/marker-shadow.png',
                  popupAnchor: [13, 0],
                });

                let innerHTML = '';
                let searchQuery = '';
                if (response.address) {
                  let result = Object.keys(response.address).map((e, index) => {
                    innerHTML +=  e + ' = ' + response.address[e] + '<br>';
                    if (e!='ISO3166-2-lvl4' && e!='country_code') searchQuery += (index ? ', ' : '') + response.address[e]
                  });
                };
                var popup = this.mapService.L.popup().setContent(`<strong>[${res.city.Location.Latitude.toFixed(3)}, ${res.city.Location.Longitude.toFixed(3)}]</strong><br>${innerHTML}`);
                // console.log(`${ this.mapService.L.control.getMousePosition() }`)
                // this.marker = this.mapService.L.marker([lat, lng], { icon, draggable:false }).bindPopup(popup);
                this.marker = this.mapService.L.marker([res.city.Location.Latitude, res.city.Location.Longitude], { icon, draggable:true }).bindPopup(popup);
  
                this.marker.addTo(this.map);
                this.marker.openPopup({lat: res.city.Location.Latitude, lng: res.city.Location.Longitude});

                console.log('searchQuery = ', searchQuery);
                this.searchPlace(searchQuery).then((data) => {
                  if (data) {
                    console.log('>>>>DATA', data)
                    this.selectEvent(data[0]);
                  }
                  // this.marker = this.mapService.L.marker([res.city.location.latitude, res.city.location.longitude], { icon, draggable:true }).bindPopup(this.popup);
                  // this.marker.name = 'userGeoMarker'
                  // this.marker.addTo(this.map);
  
                  resolve(res);
                  this.loadingMapResults = false;
                });
              }

            });
          }
        }
      }/* ,
      (error: any) => {
        this.toastr.error('Error with provided IP address. Retry!');
        this.loadingMapResults = false;
      } */);
    }).catch((ex)=> {
      this.toastr.error('Error with provided IP address. Retry!');
    }).finally(()=> {
      this.loadingMapResults = false;
    });

    return promise;
  }

  getGeoLocation2(ip: string)
  {
    this.coordsFromIP = true;
    this.popup = this.mapService.L.popup().setContent('<span style="color:red;">Your estimated location</span>');

    const promise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return;
        let hasIPChanged:boolean = false;
        let res: any = window.localStorage.getItem('geo');
        res = JSON.parse(res);

        let localStorageIPAddress: any = window.localStorage.getItem('IPAddress');

        if (localStorageIPAddress !== this.ipAddress) {
          window.localStorage.setItem('IPAddress', this.ipAddress);
          hasIPChanged = true;
        }

        // this.httpClient.post(`/api/v1/ip2location`, {ip: this.ipAddress}).subscribe((res:any) => {
        this.geolocationService.ip2Location(ip).subscribe((res:any) => {
            this.lat = res.city.Location.Latitude;
            this.lon = res.city.Location.Longitude;
            this.city = `${res.city.City.Names.en}`;
            window.localStorage.setItem('geo-maxmind', JSON.stringify(res));
            let localStorageGeo: any = JSON.parse(window.localStorage.getItem('geo'));
            localStorageGeo.latitude = this.lat;
            localStorageGeo.longitude = this.lon;
            localStorageGeo.city = this.city;
            localStorageGeo.subdivisions = `${res.city.subdivisions? res.city.subdivisions[0].names.en: ''}`
            window.localStorage.setItem('geo', JSON.stringify(localStorageGeo));

            if (res && !hasIPChanged) {
              res.latitude = this.lat;
              res.longitude = this.lon;
              this.country = res.country_name;
              // this.city = res.city;
              this.countryCode = res.country_code2;
              this.regionName = res.city;
              // this.lat = res.latitude;
              // this.lon = res.longitude;
              this.country_flag = res.country_flag;
              resolve(res);
            } else {
              // e341bebc49334ad29b0ed2e363d6f537
              // this.httpClient.get(`http://ip-api.com/json/${ip}`).subscribe((res:any)=>{
              // Keep the below for now to keep flag icons
                this.httpClient.get(`https://api.ipgeolocation.io/ipgeo?apiKey=e341bebc49334ad29b0ed2e363d6f537&ip=${ip}`).subscribe((res:any) => {
                  res.latitude = this.lat;
                  res.longitude = this.lon;
                  res.city = this.city;
                  window.localStorage.setItem('geo', JSON.stringify(res));
                  this.country = res.country_name;
                  // this.city = res.city;
                  this.countryCode = res.country_code2;
                  this.regionName = res.city;
                  // this.lat = res.latitude;
                  // this.lon = res.longitude;
                  // flag url = "https://ipgeolocation.io/static/flags/ca_64.png"
                  this.country_flag = res.country_flag;
                  
                  resolve(res);
                });
            }
        });
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


  public loadMap(userInitiated:boolean = false): void {
    let res: any = window.localStorage.getItem('geolocation-allowed')
    res = JSON.parse(res);
    if (res && res.lat) this.coordsFromIP = false;
    else this.coordsFromIP = true;

    this.popup = this.mapService.L.popup().setContent(res?'<strong>You!</strong>': '<span style="color:red;">Your estimated location</span>');

    if (!this.map) {
      if (!userInitiated || this.mapReferer == 'world' || !this.selectedCountryCode) {
        this.map = this.mapService.L.map('map', {attributionControl: false}).setView([0, 0], 1);
      } else {
        this.map = this.mapService.L.map('map', {attributionControl: false}).setView([this.lat, this.lon], 1);
      }
      this.mapService.L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      //   id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
      //   accessToken: environment.mapbox.accessToken,
      }).addTo(this.map);
    }

    if (!userInitiated && (this.mapReferer == 'world' || !this.selectedCountryCode)) {
      this.map.flyTo([this.lat, this.lon], 2);
    } else {
      this.map.flyTo([this.lat, this.lon], 13);
    }
    const icon = this.mapService.L.icon({
      iconUrl: '../../../assets/marker-icon.png',
      shadowUrl: '../../../assets/marker-shadow.png',
      popupAnchor: [13, 0],
    });

    this.map.eachLayer((layer) => {
      // If the name property on the marker matches the name entered in the prompt:
      if (layer.name === "userIPMarker" || layer.name === "userGeoMarker") {
        // Remove the marker:
        layer.removeFrom(this.map);
      } else {
      }
    });

    this.popup = this.mapService.L.popup().setContent(!this.coordsFromIP?'<strong>You!</strong>': '<span style="color:red;">Your estimated location</span>');

    if (this.mapReferer != 'world' && !userInitiated && !res) {
      this.getCurrentPositionByIPAddress().subscribe((position: any) => {
        this.map.flyTo([position.latitude, position.longitude], 13);
        this.marker = this.mapService.L.marker([position.latitude, position.longitude], { icon, draggable:true }).bindPopup(this.popup);
        this.marker.name = 'userIPMarker';
        this.marker.addTo(this.map);
      });
    } else { //if ((this.mapReferer != 'world' && res) || (this.mapReferer != 'world' && userInitiated)) {
      this.getCurrentPosition().subscribe((position: any) => {
        this.map.flyTo([position.latitude, position.longitude], 13);

        this.marker = this.mapService.L.marker([position.latitude, position.longitude], { icon, draggable:true }).bindPopup(this.popup);
        // this.marker.name = 'userGeoMarker'
        this.marker.addTo(this.map);
      });
    }
  }

  private searchPlace(q:string): any {
    // console.log('q = ', q)
    if (!q || q.length < 3) return;
    const promise = new Promise((resolve, reject) => {
      this.loadingMapResults = true;
      this.httpClient.get(`https://nominatim.openstreetmap.org/search.php?q=${q}&polygon_geojson=1&format=jsonv2`).subscribe((res:any) => {
        if (res.length) {
          this.mapPlaces = res;
          // let geojsonFeature = res[0].geojson;
          // this.mapService.L.geoJSON(geojsonFeature).addTo(this.map);

          // var corner1 = this.mapService.L.latLng(res[0].boundingbox[0], res[0].boundingbox[2]),
          // corner2 = this.mapService.L.latLng(res[0].boundingbox[1], res[0].boundingbox[3]),
          // bounds = this.mapService.L.latLngBounds(corner1, corner2);
          // // this.map.fitBounds(bounds);
          // this.map.flyToBounds(bounds);
        }
        resolve(res);
      });
    }).catch((ex)=> {
      console.log("ERRR = ", ex)
      this.toastr.error('Error loading map. Retry!');
    }).finally(()=> {
    }) ;
    return promise;
  }

  private gotoSearchedPlace(item) {
    const promise = new Promise((resolve, reject) => {
      let geojsonFeature = item.geojson;
      this.mapService.L.geoJSON(geojsonFeature).addTo(this.map);

      var corner1 = this.mapService.L.latLng(item.boundingbox[0], item.boundingbox[2]),
      corner2 = this.mapService.L.latLng(item.boundingbox[1], item.boundingbox[3]),
      bounds = this.mapService.L.latLngBounds(corner1, corner2);
      // this.map.fitBounds(bounds);
      this.map.flyToBounds(bounds);
      // this.map.saqib
      resolve(true)
    }).catch((ex)=> {
    }).finally(()=> {
    });
    return promise;
  }

  private selectLocation() {
    this.map.on('click', (e) => {
        var coord = e.latlng;
        var lat = coord.lat;
        var lng = coord.lng;
        // console.log('You clicked the map at latitude: ' + lat + ' and longitude: ' + lng);

        const icon = this.mapService.L.icon({
          iconUrl: '../../../assets/marker-icon.png',
          shadowUrl: '../../../assets/marker-shadow.png',
              // iconSize:     [38, 95], // size of the icon
          // shadowSize:   [50, 64], // size of the shadow
          // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
          // shadowAnchor: [4, 62],  // the same for the shadow
          // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
          iconAnchor:   [13, 41],
          popupAnchor: [0, -41],
        });
        
        // var mp = new this.mapService.L.Marker([lat, lng], { icon }).addTo(this.map);
        // alert(mp.getLatLng());
        let url = `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lng}&zoom=18&format=jsonv2`;
        this.httpClient.get(url).subscribe((res:any) => {
          if (res) {
            let innerHTML = '';
            if (res.address) {
              let result = Object.keys(res.address).map(e => {
                innerHTML +=  e + ' = ' + res.address[e] + '<br>';
              });
            };
            var popup = this.mapService.L.popup().setContent(`<strong>[${lat.toFixed(3)}, ${lng.toFixed(3)}]</strong><br>${innerHTML}`);        
            // console.log(`${ this.mapService.L.control.getMousePosition() }`)
            this.marker = this.mapService.L.marker([lat, lng], { icon, draggable:false }).bindPopup(popup);
            this.marker.addTo(this.map);
            this.marker.openPopup(coord);
            /* var corner1 = this.mapService.L.latLng(res.boundingbox[0], res.boundingbox[2]),
            corner2 = this.mapService.L.latLng(res.boundingbox[1], res.boundingbox[3]),
            bounds = this.mapService.L.latLngBounds(corner1, corner2);
            this.map.fitBounds(bounds); */
          }
        }),
        (error: any) => {
          console.log(error);
          // this.toastr.error('Location detail is not available');
        }
    });
  }

  requestLocation(): void {
    this.geolocationService.getCurrentPosition()
      .then((position) => {
        this.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        this.error = null;
        this.permissionDenied = false;
      })
      .catch((error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.permissionDenied = true;
        }
        this.error = error.message;
        this.location = null;
      });
  }

}
