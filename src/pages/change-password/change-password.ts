import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import {ApiQuery} from '../../library/api-query';
import {Http} from '@angular/http';

/**
 * Generated class for the ChangePasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
})
export class ChangePasswordPage {

  form: { form: any } = {form: {oldPassword: {'label':'סיסמה ישנה'}, password: {second: {'label': 'סיסמה חדשה בשנית'}, first: {'label':'סיסמה חדשה'}}, email: {}, _token: {}, text: {}}};
  
  oldPassword: any;
  first_pass: any;
  second_pass: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public http: Http,
              public api: ApiQuery,
              public toastCtrl: ToastController) {
  }

  formSubmit() {
    
            var params = JSON.stringify({
                changePassword: {
                    oldPassword: this.form.form.oldPassword.value,
                    password: {
                        first: this.form.form.password.first.value,
                        second: this.form.form.password.second.value
                    },
                    _token: this.form.form._token.value,
                }
            });
    
            this.http.post(this.api.url + '/passwords', params, this.api.header).subscribe(data => this.validate(data.json()));
    }
    
        validate(response) {

            response = response.success;

    
            if (response.changed == true) {
    
               // this.api.setStorageData({label: 'password', value: this.form.form.password.first.value});
                this.api.setHeaders(true, false, this.form.form.password.first.value);
    
                this.form.form.password.first.value = "";
                this.form.form.password.second.value = "";
                this.form.form.oldPassword.value = "";

                this.api.storage.remove('fingerAuth');
                this.api.storage.remove('enableFingerAuth');
                this.api.storage.remove('disableFingerAuthInit');
                this.api.storage.remove('fingerAuthLogin');
    
                const toast = this.toastCtrl.create({
                    message: response.texts.success,
                    showCloseButton: true,
                    closeButtonText: 'אישור'
                });
                toast.present();
            }
            else{
                //this.oldPassword = response.error.password.first;
                this.first_pass = response.error.password.first;
                this.second_pass = response.error.password.second;
            }
        }
    
        ionViewDidLoad() {
            console.log('ionViewDidLoad ChangePasswordPage');
        }
    
        ionViewWillEnter() {
            this.api.pageName = 'ChangePasswordPage';
        }

}
