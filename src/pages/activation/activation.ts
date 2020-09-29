import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController, ToastController} from 'ionic-angular';
import {ApiQuery} from '../../library/api-query';
import {Http} from '@angular/http';
import {HomePage} from "../home/home";

// import { LoginPage } from '../login/login';

/**
 * Generated class for the ActivationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-activation',
  templateUrl: 'activation.html',
})
export class ActivationPage {

  form: { errorMessage: any, res: any, description: any, success: any, submit: any, phone: { label: any, value: any }, code: { label: any, value: any } } =
      {
        errorMessage: '',
        res: false,
        description: '',
        success: '',
        submit: false,
        phone: {label: '', value: ''},
        code: {label: '', value: ''}
      };

  showContact = false;
  canResend: boolean;
  texts: object = {};
  code: string;
  contact: any;
  errors: any = {};
  formErrors = false;
  sendSuccess = false;

  constructor(public navCtrl: NavController,
              public loadingCtrl: LoadingController,
              public navParams: NavParams,
              public api: ApiQuery,
              public http: Http,
              public toastCtrl:  ToastController) {


    this.api.http.get(this.api.url + '/user/activation', this.api.header).subscribe((data: any) => {
      data = data.json();
      this.texts = data.texts;
      this.canResend = data.canResend;
      this.contact = data.contact;
      console.log(this.texts);

      if (this.api.isActivated) {
          this.navCtrl.push(HomePage);
      }
    });


  }

  activate() {
    this.api.http.post(this.api.url + '/user/activation/activate', this.code, this.api.header).subscribe( (data: any) => {
        data = data.json();
        let toast = this.toastCtrl.create({
           'message': data.message,
           'duration': 2500,
            dismissOnPageChange: false,
        });

        toast.present();

        if (data.success) {
            this.navCtrl.push(HomePage);
            this.api.isActivated = true;
        }
    } )
  }

  resend() {
    this.api.http.get(this.api.url + '/user/activation/resend', this.api.header).subscribe( (data: any) => {
        data = data.json();

        if (data.success) this.canResend = false;
        this.toastCtrl.create({
            'message': data.messege,
            'duration': 2500
        }).present();
    } )
  }

  sendEmail() {
      this.showContact = false;
      if (! (this.contact.text.value == '' || this.contact.subject.value == '')) {
          var params = {
              userId: 0,
              messageToAdmin: this.contact.text.value,
              subjectToAdmin: this.contact.subject.value,
              userEmail : this.contact.email.value,
              logged_in: true
          };

          this.http.post(this.api.url + '/contactUs', params, this.api.header).subscribe((res: any) => {
              res = res.json();
              if (!res.result) {
                  this.showContact = true;
              } else {
                  this.contact.text.value = '';
                  this.contact.subject.value = '';
                  this.contact.email.value = '';
                  this.toastCtrl.create({
                      message: this.contact.successSend,
                      duration: 2500,
                      showCloseButton: false
                  }).present()
              }
          });
      }
  }

  ionViewWillEnter() {
      this.api.pageName = 'ActivationPage';

  }

}
