import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TrendingNoozService {
  apiUrl = environment.noozDomain;
  TrendingNooz: any;

  showSearch: boolean;
  private inSearchSubject = new BehaviorSubject<boolean>(false);
  inSearch$ = this.inSearchSubject.asObservable();

  private trendingNoozSubject = new BehaviorSubject<any>([]);
  trendingNooz$ = this.trendingNoozSubject.asObservable();

  constructor(private http: HttpClient) {}

  updateValue(newVal: any) {
    this.trendingNoozSubject.next(newVal);
  }

  updateInSearch(newVal: any) {
    this.inSearchSubject.next(newVal);
  }

  getTrendingNooz(pageNumber: number, pageSize: number): Observable<any> {
    this.showSearch=false;
    this.updateInSearch(this.showSearch);
    let urlMethod =
      "/GetTrendingNooz?lat=0&lon=0&pageNumber=" +
      pageNumber +
      "&pageSize=" +
      pageSize;
    // console.log('endpoint = ', this.apiUrl + urlMethod);

    let response: any = this.http.get(this.apiUrl + urlMethod);
    
    return response;
  }

  getFiltered(TrendingNooz: any, filterString: string): Observable<any> {
    this.showSearch=true;
    console.log('filterString = ', filterString)
    if (filterString) {
      TrendingNooz = TrendingNooz.filter(s => {
        filterString = filterString.toUpperCase();
        console.log('blob = ', filterString, s.Blurb.toUpperCase(), s.Blurb.toUpperCase().indexOf(filterString))
        if (s.Blurb && s.Blurb.toUpperCase().indexOf(filterString) >= 0) {
          return true;
        }
      })
    }
    // console.log(AllNooz);
    this.updateValue(TrendingNooz);
    this.updateInSearch(this.showSearch);
    return TrendingNooz;
  }
}
