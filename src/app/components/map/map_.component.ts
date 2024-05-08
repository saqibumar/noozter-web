import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/app/services/map.service';
import * as L from 'leaflet';
// import { antPath } from 'leaflet-ant-path';
import { Map, Polygon, Circle, Marker } from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponentX implements OnInit {
  public message: string;
  private map: Map;
  private circle: Circle;
  private polygon: Polygon;
  private marker: Marker;

  constructor(
    private mapService: MapService,
  ) { }

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
  }

}
