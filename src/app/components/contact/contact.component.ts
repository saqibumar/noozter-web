import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContactService } from './contact.service';
import { GeolocationService } from '../map/geolocation.service';
import { error } from 'console';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  contactForm: FormGroup;
  loading: boolean;
  btnSubmitted: boolean;
  mailSuccess: boolean = undefined;

  constructor(
    private contactService: ContactService,
    private geolocationService: GeolocationService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      from: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+(?:[0-9] ?){6,14}[0-9]$/)]],
      name: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  ngOnInit() {

  }

  onSubmit() {
    this.btnSubmitted = true;
    // console.log(this.contactForm)
      // console.log(this.contactForm.value);
      this.loading = true;
    if (this.contactForm.valid) {
      this.geolocationService.detectIP().subscribe((res:any) => {
        this.contactForm.value.detectedIP = res.ip;

        this.contactService.sendMail(this.contactForm.value).subscribe((res:any) => {
          this.loading = false;
          this.mailSuccess = res.success;
        }),
        (error: any) => {
          console.log('>>>>>1', error);
          this.mailSuccess = false;
          this.loading = false;
          this.btnSubmitted = false;
          this.toastr.error('Message sending failed.');
        };

      }),
      (error: any) => {
        console.log('>>>>>2', error);
        this.mailSuccess = false;
        this.loading = false;
        this.btnSubmitted = false;
        this.toastr.error('Failed!');
      };
    } else {
      // Handle form validation errors
      this.loading = false;
      this.toastr.error('Please fill in the required fields correctly.');
    }
  }

  get from() {
    return this.contactForm.get('from');
  }

  get phone() {
    return this.contactForm.get('phone');
  }

  get name() {
    return this.contactForm.get('name');
  }

  get body() {
    return this.contactForm.get('body');
  }

}
