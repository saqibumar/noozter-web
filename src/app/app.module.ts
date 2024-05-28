import { AllNoozComponent } from './components/all-nooz/all-nooz.component';
// import { ToastrService } from './services/toastr.service';
import { ToastrModule } from 'ngx-toastr';
import { AuthInterceptor } from './services/auth.interceptor';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
//import { EmbedVideo } from 'ngx-embed-video';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { NoozComponent } from './components/nooz/nooz.component';
import { SafePipe } from './services/safe.pipe';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { TermsConditionsComponent } from './components/terms-conditions/terms-conditions.component';
import { TrendingNoozComponent } from './components/trending-nooz/trending-nooz.component';
import { MapComponent } from './components/map/map.component';
import { AutocompleteLibModule } from './modules/autocomplete-lib-module.module';
import { InvestorPageComponent } from './components/investor-page/investor-page.component';
import { InvestDialogComponent } from './components/invest-dialog/invest-dialog.component';

// import { MatDialogModule } from '@angular/material/dialog';
// import { MatButtonModule } from '@angular/material/button';

const appRouter: Routes = [
  /*  { path: 'maps/:schoolCode', component: MapsComponent},
   { path: 'formsDyn', component: DynamicFormsComponent},
   { path: 'file', component: EnviarArchivosComponent},
   { path: 'editor', component: WysiwygEditorComponent},
   { path: 'multiple', component: MaterialMultiSelectComponent},
   { path: 'reporte-dictamen', component: ReporteDictamenComponent},
   { path: 'plantilla', component: CtComponent},
   { path: 'plantilla/:schoolCode', component: CtComponent, pathMatch: 'full'},
   { path: 'pendientes', component: PendientesComponent },
   { path: 'atendidas', component: AtendidasComponent },            
   { path: 'ficha-de-usuario', component: FichacctComponent}, */
  // { path: ':Token', component: HomeComponent },
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  // { path: 'privacy', component: PrivacyComponent },
  { path: 'about', component: AboutComponent },
  { path: 'investor', component: InvestorPageComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'map', component: MapComponent },
  { path: 'terms', component: TermsConditionsComponent },
  {
    path: 'trending-nooz',
    component: TrendingNoozComponent,
  },
  {
    path: 'world-nooz',
    component: AllNoozComponent,
  },
  {
    path: 'world-nooz/:countryCode',
    component: AllNoozComponent,
  },
  {
    path: 'world-nooz/:lat/:lon',
    component: AllNoozComponent,
  },

  { path: 'nooz/:noozId/:countryName/:cityName', component: NoozComponent },

  /*    { path: 'home/:schoolCode', component: HomeComponent },
   { path: 'home/:Token', component: HomeComponent }, */

  // { path: '**', redirectTo: 'home' },
];
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    NoozComponent,
    SafePipe,
    PrivacyComponent,
    AboutComponent,
    ContactComponent,
    MapComponent,
    TermsConditionsComponent,
    AllNoozComponent,
    TrendingNoozComponent,
    InvestorPageComponent,
    InvestDialogComponent,
  ],
  imports: [
    AutocompleteLibModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    // MatDialogModule,
    // MatButtonModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule,
    RouterModule.forRoot(appRouter /* , {onSameUrlNavigation: 'reload'} */, {
    initialNavigation: 'enabled',
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'legacy'
}),
  ],
  providers: [
    // ToastrService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
