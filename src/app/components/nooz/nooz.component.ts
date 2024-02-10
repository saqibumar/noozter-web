import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NoozService } from './nooz.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// import { ToastrService } from "src/app/services/toastr.service";
import { ToastrService } from 'ngx-toastr';
import { Meta, Title } from '@angular/platform-browser';
import { AllNoozService } from '../all-nooz/all-nooz.service';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-nooz',
  templateUrl: './nooz.component.html',
  styleUrls: ['./nooz.component.css'],
})
export class NoozComponent implements OnInit {
  showSearch: boolean;
  constructor(
    private allnoozSvc: AllNoozService,
    private noozSvc: NoozService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private title: Title,
    private meta: Meta
  ) {
    //this.safeSrc =  this.sanitizer.bypassSecurityTrustResourceUrl("https://noozmedia.blob.core.windows.net/noozmedia/6bb04c55-b6fe-491f-ae96-0b17b0f93963.mp4");
  }

  safeSrc: SafeResourceUrl;
  blurb: string;
  city: string;
  country: string;
  story: string;
  NoozMedias: any[];
  isLoading: boolean = true;
  htmlSnippet: string;
  CreatedDate: string;

  ngOnInit() {
    this.allnoozSvc.inSearch$.subscribe(msg => this.showSearch = msg);
    this.showSearch = false;
    let noozId, country, city;
    this.route.params.subscribe((params) => {
      //console.log(params);
      noozId = params.noozId;
      country = params.coutnryName;
      city = params.cityName;
    });

    this.meta.updateTag({
      property: 'og:type',
      content: 'video.other',
    });
    this.meta.updateTag({
      property: 'og:site_name',
      content: 'Noozter',
    });
    this.meta.updateTag({
      name: 'keywords',
      content:
        "Current, news, latest news, Know what's happening around. Post and share with your community",
    });

    //this.noozSvc.getNoozDetails(67,'Mexico','Mexico City').subscribe(data => {
    this.noozSvc.getNoozDetails(noozId, city, country).subscribe(
      (data) => {
        // console.log(data);
        this.CreatedDate = data.CreatedDate;
        this.NoozMedias = data.NoozMedias;
        this.blurb = data.Blurb;
        this.city = data.City;
        this.country = data.Country;
        this.story = data.Story;
        this.isLoading = false;
        this.title.setTitle(this.blurb);
        this.meta.updateTag({
          name: 'description',
          content: this.story,
        });

        this.meta.updateTag({
          property: 'og:description',
          content: this.story + '. ' + this.city + ' ' + this.country,
        });
        this.meta.updateTag({
          property: 'og:title',
          content: this.blurb,
        });
        this.meta.updateTag({
          property: 'og:pubdate',
          content: this.CreatedDate,
        });
        this.meta.updateTag({
          name: 'pubdate',
          content: this.CreatedDate,
        });
        this.meta.updateTag({
          name: 'lastmod',
          content: this.CreatedDate,
        });
        this.allnoozSvc.updateInSearch(this.showSearch);
      },
      (error) => {
        //console.log("Error: ", error);
        this.toastr.error('Nooz not available.');
        this.isLoading = false;
      },
      () => {
        //to keep mp4 video on top
        this.NoozMedias = this.array_move(this.NoozMedias);

        //console.log("api call finished");
      }
    );
  }

  array_move(arr: any) {
    //console.log("BEFORE>>>", arr);
    for (var x in arr) {
      arr[x].MediaExtension == '.mp4' ? arr.unshift(arr.splice(x, 1)[0]) : 0;
      if (arr[x].MediaExtension != '.mp4') {
        // console.log(arr[x].Uri);
        this.meta.updateTag({
          property: 'og:image',
          content: arr[x].Uri,
        });
        this.meta.updateTag({
          name: 'thumbnail',
          content: arr[x].Uri,
        });
      }
    }
    // console.log("AFTER>>>", arr);
    return arr; // for testing
  }

  ngAfterViewInit() {
    //const video = document.getElementById('my-video');
    // const _video = document.getElementsByTagName('video');
    // console.log(_video);
    /* _video.play(
      .catch(err)=>{
        console.log(err);
      }); */
  }
}
