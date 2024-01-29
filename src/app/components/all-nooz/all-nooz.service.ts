import { environment } from "./../../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AllNoozService {
  apiUrl = environment.noozDomain;
  constructor(private http: HttpClient) {}

  getAllNooz(
    CountryCode: string,
    pageNumber: number,
    pageSize: number
  ): Observable<any> {
    let urlMethod =
      "/GetCountryNooz?country=" +
      CountryCode +
      "&pageNumber=" +
      pageNumber +
      "&pageSize=" +
      pageSize;
    //console.log(this.apiUrl + urlMethod);
    return this.http.get(this.apiUrl + urlMethod);
  }
}
