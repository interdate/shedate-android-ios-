import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import {ApiQuery} from '../../library/api-query';
import {Storage} from '@ionic/storage';
import {Http} from '@angular/http';
import {LoginPage} from "../login/login";


/**
 * Generated class for the FreezeAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-freeze-account',
  templateUrl: 'freeze-account.html',
})
export class FreezeAccountPage {

  public form: any = {text: {value: ''}, description: ''};

  public err: any = {status: '', text: ''};

  allfields = '';

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, public api: ApiQuery, public navParams: NavParams, public http: Http, public storage: Storage,) {

}

submit() {

          if (this.form.text.value == '') {
              this.allfields = 'יש להכניס סיבה להקפאה';
          } else {

            var params = JSON.stringify({
               'freeze_account_reason': this.form.text.value
           });

           this.http.post(this.api.url + '/freeze', params, this.api.header).subscribe(data => this.validate(data.json()));


        }
  }

      ionViewWillEnter() {
          this.api.pageName = 'FreezeAccountPage';
      }

      validate(response) {
          console.log(response);

          if(response.success) {
              let alert = this.alertCtrl.create({
                  title: response.message,
                  buttons: ['Ok']
              });
              alert.present();

              this.navCtrl.push(LoginPage, {page: {_id: "logout"}});

          }


      }

}
