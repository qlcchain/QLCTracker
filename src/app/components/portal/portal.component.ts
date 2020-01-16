import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss']
})
export class PortalComponent implements OnInit {

  applicationForm = new FormGroup({
    telegram: new FormControl('',Validators.compose([
      Validators.required,
      Validators.minLength(1)
    ])),
    email_address: new FormControl('',Validators.compose([
      Validators.required,
      Validators.maxLength(240),
      Validators.minLength(5)
    ])),
    qlc_address: new FormControl('',Validators.compose([
      Validators.required,
      Validators.maxLength(64),
      Validators.minLength(64)
    ])),
    applicationType: new FormControl('1'),
    ipAddress: new FormControl('1'),
    hardwareType: new FormControl('1'),
    bandwidth: new FormControl('',Validators.required),
    storage: new FormControl('',Validators.required),
    memory: new FormControl('',Validators.required),
    cpu: new FormControl('',Validators.required),
    os: new FormControl('',Validators.required),
    hardwareModel: new FormControl('1'),
    miningAlgo: new FormControl('1'),
    computational_power: new FormControl('',Validators.required),
    
  });

  button_text = 'SEND APPLICATION';
  sending_status = 0;

  constructor(
    private api:ApiService
  ) { }

  ngOnInit() {
  }

  checkForm() {
    this.markFormGroupTouched(this.applicationForm);
    if (this.applicationForm.value.applicationType == 1) {
      if (this.applicationForm.get('telegram').status == 'VALID' &&
          this.applicationForm.get('email_address').status == 'VALID' &&
          this.applicationForm.get('qlc_address').status == 'VALID' &&
          this.applicationForm.get('bandwidth').status == 'VALID' &&
          this.applicationForm.get('storage').status == 'VALID' &&
          this.applicationForm.get('memory').status == 'VALID' &&
          this.applicationForm.get('cpu').status == 'VALID' &&
          this.applicationForm.get('os').status == 'VALID' 
      ) {
        window.scrollTo(0, 0);
        this.apply();
        return;
      } 
    } else if (this.applicationForm.value.applicationType == 2) {
      if (this.applicationForm.get('telegram').status == 'VALID' &&
          this.applicationForm.get('email_address').status == 'VALID' &&
          this.applicationForm.get('qlc_address').status == 'VALID' &&
          this.applicationForm.get('hardwareModel').status == 'VALID' &&
          this.applicationForm.get('miningAlgo').status == 'VALID' &&
          this.applicationForm.get('computational_power').status == 'VALID'
      ) {
        window.scrollTo(0, 0);
        this.apply();
        return;
      }
    }
    if (this.applicationForm.status === 'VALID') {
      window.scrollTo(0, 0);
      return;
    }
  }

  async apply() {
    this.button_text = 'SENDING, PLEASE WAIT....';
    this.sending_status = 1;
    const response = await this.api.portalApply(this.applicationForm.value);
    if (response.status) {
      if (response.status == 1) {
        this.button_text = 'SUCCESSFUL SENT';
        this.sending_status = 2;
      } else {
        this.button_text = 'ERROR - PLEASE TRY AGAIN';
        this.sending_status = 0;
      }
    } else {
      this.button_text = 'ERROR - PLEASE TRY AGAIN';
      this.sending_status = 0;
    }

  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

}
