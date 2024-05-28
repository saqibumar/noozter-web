import { environment } from "./../../environments/environment";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpHeaders,
  HttpParams,
  HttpHeaderResponse,
} from "@angular/common/http";
import { ActivatedRoute, Router, ActivationStart } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { tap, catchError } from "rxjs/operators";
import { throwError, Observable } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  headers: HttpHeaders;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.headers.get("No-Auth") == "True") {
      return next.handle(req.clone());
    }
    let res: any;
    let ok: string;
    // console.log('INTERCEPTED');

    let token = environment.authToken;
    if (token != null) {
      let headers: HttpHeaders;

      headers = new HttpHeaders({
        /*  Authorization: `${token}`,
          'Content-Type': 'application/json; charset=UTF-8' */
        //"Access-Control-Allow-Credentials" : "false",
        //  "Access-Control-Allow-Origin" : "*" //environment.noozDomain
        Authorization: token,
        "Content-Type": "application/json; charset=UTF-8",
      });

      const clonedreq = req.clone({
        /* setParams: { CountryName: "Mexico", City: "Mexico City" }, */
        headers,
      });
      // console.log(clonedreq);
      return next.handle(clonedreq).pipe(
        tap(
          (event) => {
            ok = event instanceof HttpResponse ? "succeeded" : "";
            if (ok) {
              //Here we receive a new token from the header and set in local storage
              res = event;
              // console.log(res);
            }
          },
          (err) => {
            //The line below redirects any api failure to home page
            this.router.navigate(["/home"]);
            if (err.status === 401) {
              // console.log(err);
            } else if (err.status === 600) {
              // console.log(err.error + err.status);
              //this.toastr.Error("Error de operación", "Error " + err.statusText);
            } else if (err.status === 415) {
              // console.log(err.error + err.status);
              // this.toastr.Error("Error de operación", "Error " + err.statusText);
            } else if (err.status === 500) {
              // console.log(err.error + err.status);
              // this.toastr.Error("Error de operación", "Error " + err.statusText);
            }else {
              // console.log('ERROR in else ' + err.url);
              // console.log(err);
              //this.toastr.Error(err.error, "Error " + err.statusText);
            }
          }
        )
      );
    } else {
      console.log('Token was null. Redirecting...');
    }
  }
}
