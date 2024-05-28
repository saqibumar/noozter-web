import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpBackend  } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
    noozterAPI = environment.noozterAPI;
    private httpClientByPass: HttpClient;
  
    constructor(private http: HttpClient, httpBackend: HttpBackend,) {
      this.httpClientByPass = new HttpClient(httpBackend);
    }

    sendMail(email: Mail): Observable<any> {
        let urlMethod =
          "/Comms/SendMail"
        let response: any = this.http.post(this.noozterAPI + urlMethod, email);
        return response;
      }
}

interface Mail {
    
        From: string;
        To: string;
        Subject: string;
        Name?: string | null;
        Phone: string;
        Body: string;
  }