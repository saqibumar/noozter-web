import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpBackend  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  noozterAPI = environment.noozterAPI;
  private httpClientByPass: HttpClient;

  constructor(private http: HttpClient, httpBackend: HttpBackend,) {
    this.httpClientByPass = new HttpClient(httpBackend);
  }

  ip2Location(ip: string): Observable<any> {
    let urlMethod =
      "/GeoMap/IpToLocation"
    let response: any = this.http.post(this.noozterAPI + urlMethod, { ip });
    return response;
  }

  detectIP(): Observable<any> {
    let urlMethod =
      "/GeoMap/DetectIP"
    let response: any = this.http.get(this.noozterAPI + urlMethod);
    return response;
  }

  public getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          console.log('POSITION = ', position);
          resolve(position)
        },
        (error) => {
          reject(error)
        });
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }
}

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy: number;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

interface GeolocationPositionError {
  code: number;
  message: string;
}