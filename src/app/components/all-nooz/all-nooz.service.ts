import { environment } from "./../../../environments/environment";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient, HttpBackend  } from '@angular/common/http';

@Injectable({
  providedIn: "root",
})
export class AllNoozService {
  apiUrl = environment.noozDomain;
  AllNooz: any;

  showSearch: boolean;
  private inSearchSubject = new BehaviorSubject<boolean>(false);
  inSearch$ = this.inSearchSubject.asObservable();

  private allNoozSubject = new BehaviorSubject<any>([]);
  allNooz$ = this.allNoozSubject.asObservable();

  private httpClientByPass: HttpClient;

  constructor(private http: HttpClient, httpBackend: HttpBackend,) {
    this.httpClientByPass = new HttpClient(httpBackend);
  }

  updateValue(newVal: any) {
    this.allNoozSubject.next(newVal);
  }

  updateInSearch(newVal: any) {
    this.inSearchSubject.next(newVal);
  }

  getAllNooz(CountryCode: string, pageNumber: number, pageSize: number): Observable<any> {
    this.showSearch=false;
    this.updateInSearch(this.showSearch);
    let urlMethod =
      "/GetCountryNooz?country=" +
      CountryCode +
      "&pageNumber=" +
      pageNumber +
      "&pageSize=" +
      pageSize;
    //console.log(this.apiUrl + urlMethod);
    // return this.http.get(this.apiUrl + urlMethod);

    let response: any = this.http.get(this.apiUrl + urlMethod);
    /* response.subscribe(data => {
      this.AllNooz = data.Items;
    }); */
    return response;
  }

  getCityNooz(lat: string, lon: string, pageNumber: number, pageSize: number): Observable<any> {
    this.showSearch=false;
    this.updateInSearch(this.showSearch);
    let urlMethod =
      "/GetNoozSummary?lat=" +
      lat +
      "&lon=" +
      lon +
      "&pageNumber=" +
      pageNumber +
      "&pageSize=" +
      pageSize;
    //console.log(this.apiUrl + urlMethod);
    // return this.http.get(this.apiUrl + urlMethod);

    let response: any = this.http.get(this.apiUrl + urlMethod);
    /* response.subscribe(data => {
      this.AllNooz = data.Items;
    }); */
    return response;
  }

  getFiltered(AllNooz: any, filterString: string): Observable<any> {
    this.showSearch=true;
    if (filterString) {
      AllNooz = AllNooz.filter(s => {
        filterString = filterString.toUpperCase();
        if (s.Blurb && s.Blurb.toUpperCase().indexOf(filterString) >= 0) {
          return true;
        }
      })
    }
    // console.log(AllNooz);
    this.updateValue(AllNooz);
    this.updateInSearch(this.showSearch);
    return AllNooz;
  }
}
