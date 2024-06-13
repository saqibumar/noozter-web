import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InvestDialogComponent } from '../invest-dialog/invest-dialog.component';
// import { ContactComponent } from '../contact/contact.component';


@Component({
  selector: 'app-investor-page',
  templateUrl: './investor-page.component.html',
  styleUrls: ['./investor-page.component.css']
})
export class InvestorPageComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openInvestDialog(): void {
    this.dialog.open(InvestDialogComponent);
    // this.dialog.open(ContactComponent);
  }

}
