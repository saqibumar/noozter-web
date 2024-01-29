import { environment } from "./../../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class NoozService {
  apiUrl = environment.noozDomain;
  constructor(private http: HttpClient) {}

  getNoozDetails(
    noozId: number,
    CountryName: string,
    CityName: string
  ): Observable<any> {
    //http://noozterwebapi.azurewebsites.net/api/v1/nooz/67?CountryName=Mexico&CityName=Mexico%20City
    let urlMethod =
      "/" + noozId + "?CountryName=" + CountryName + "&CityName=" + CityName;
    // console.log(this.apiUrl+urlMethod);
    return this.http.get(this.apiUrl + urlMethod);
  }
}
