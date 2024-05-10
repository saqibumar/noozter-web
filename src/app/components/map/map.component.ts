import { AfterViewInit, Component, Input, VERSION } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as L from 'leaflet';
import { MapService } from 'src/app/services/map.service';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
// import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
    // title = "Find places using angular version " + VERSION.major;
    title = "Find places on map. Click on map to reveal info";
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
  marker: any;

  constructor(
    private mapService: MapService,
    private toastr: ToastrService,
    httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(httpBackend);
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
        // this.getIPAddressAndGeoLocation().then(async (data) => {
            this.getGeoLocation(this.ipAddress).then((response) => {
                this.loadMap();
                this.selectLocation();
            });
            /* if (this.mapService.L) {
                this.loadMap();
            } */
        // });
    }
  }

  private getCurrentPositionByIPAddress(): any {
    return new Observable((observer: Subscriber<any>) => {
      this.coordsFromIP = true;
      // console.log(error);
      this.coordsFromIP = true;
      observer.next({
          latitude: this.lat,
          longitude: this.lon,
      });
      observer.complete();
         
  });
}

  private getCurrentPosition(): any {
      return new Observable((observer: Subscriber<any>) => {
        this.coordsFromIP = false;
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
            this.marker.name = 'userGeoMarker'
            observer.complete();
            },
            // (error: GeolocationPositionError) => {
            (error: any) => {
              console.log(error);
              this.toastr.warning('The location permission was denied.')
              this.coordsFromIP = true;
              observer.next({
                  latitude: this.lat,
                  longitude: this.lon,
              });
              window.localStorage.setItem('geolocation-allowed', null);
              this.marker.name = 'userIPMarker'
              observer.complete();
            });
        } else {
          window.localStorage.setItem('geolocation-allowed', null);
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

  public loadMap(userInitiated:boolean = false): void {
    let res: any = window.localStorage.getItem('geolocation-allowed')
    res = JSON.parse(res);

    if (!this.map) {
      if (this.mapReferer == 'world') {
        this.map = this.mapService.L.map('map').setView([0, 0], 1);
      } else {
        this.map = this.mapService.L.map('map').setView([this.lat, this.lon], 1);
      }
      this.mapService.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      //   id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
      //   accessToken: environment.mapbox.accessToken,
      }).addTo(this.map);

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


    if (this.mapReferer != 'world' && !userInitiated && !res) {
      this.getCurrentPositionByIPAddress().subscribe((position: any) => {
        this.map.flyTo([position.latitude, position.longitude], 13);
  
  
        this.marker = this.mapService.L.marker([position.latitude, position.longitude], { icon, draggable:true }).bindPopup(!this.coordsFromIP?'Your location!': 'Your estimated location');
        this.marker.name = 'userIPMarker';
        this.marker.addTo(this.map);
      });
    } else if ((this.mapReferer != 'world' && res) || (this.mapReferer != 'world' && userInitiated)) {
      this.getCurrentPosition().subscribe((position: any) => {
        this.map.flyTo([position.latitude, position.longitude], 13);

        this.marker = this.mapService.L.marker([position.latitude, position.longitude], { icon, draggable:true }).bindPopup(!this.coordsFromIP?'Your location!': 'Your estimated location');
        // this.marker.name = 'userGeoMarker'
        this.marker.addTo(this.map);
      });
    }
  }

  private searchPlace(q:string): any {
    // console.log('q = ', q)
    const promise = new Promise((resolve, reject) => {
      if (q.length < 3) reject('No enough characters');
      this.httpClient.get(`https://nominatim.openstreetmap.org/search.php?q=${q}&polygon_geojson=1&format=jsonv2`).subscribe((res:any) => {
        if (res.length) {
          // console.log(res);
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
    }) ;
    return promise;
  }

  private selectLocation() {
    this.map.on('click', (e) => {
        var coord = e.latlng;
        var lat = coord.lat;
        var lng = coord.lng;
        console.log('You clicked the map at latitude: ' + lat + ' and longitude: ' + lng);

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
            // console.log(`${ this.mapService.L.control.getMousePosition() }`)
            this.marker = this.mapService.L.marker([lat, lng], { icon }).bindPopup(`[${lat.toFixed(3)}, ${lng.toFixed(3)}]\n${JSON.stringify(res.address)}`);
            this.marker.addTo(this.map);
            this.marker.openPopup(coord);
            /* var corner1 = this.mapService.L.latLng(res.boundingbox[0], res.boundingbox[2]),
            corner2 = this.mapService.L.latLng(res.boundingbox[1], res.boundingbox[3]),
            bounds = this.mapService.L.latLngBounds(corner1, corner2);
            this.map.fitBounds(bounds); */
          }
        });
    });
  }

}
