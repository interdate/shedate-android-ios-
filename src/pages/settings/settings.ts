import {Component} from "@angular/core";
import {NavController, NavParams, ToastController} from "ionic-angular";
import {ApiQuery} from "../../library/api-query";
import {Http} from "@angular/http";
import {Storage} from "@ionic/storage";
import {AndroidFingerprintAuth} from "@ionic-native/android-fingerprint-auth";


/*
 Generated class for the Settings page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage {

    form: any = {newMessPushNotif: '', userGetMsgToEmail: ''};
    fingerprintAuth: any = false;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private toastCtrl: ToastController,
                public http: Http,
                public storage: Storage,
                private androidFingerprintAuth: AndroidFingerprintAuth,
                public api: ApiQuery) {

        this.http.get(api.url + '/user/settings', api.setHeaders(true)).subscribe(data => {
            //this.form = data.json().settings;
            this.form.newMessPushNotif = Boolean(parseInt(data.json().settings.newMessPushNotif));
            this.form.userGetMsgToEmail = Boolean(parseInt(data.json().settings.userGetMsgToEmail));
        });

        this.androidFingerprintAuth.isAvailable()
            .then((androidFingerprintAuth)=> {
                    if (androidFingerprintAuth.isAvailable) {
                        this.fingerprintAuth = true;
                    }
                }
            );

        this.storage.get('enableFingerAuth').then((enableFingerAuth) => {
            if (enableFingerAuth && enableFingerAuth == '1') {
                // alert('enableFingerAuth' + enableFingerAuth);
                this.form.fingerprint = 1;
            }
        });
    }

    presentToast() {
        let toast = this.toastCtrl.create({
            message: 'נשמר',
            duration: 3000
        });

        toast.present();
    }

    submit(type) {

        let name;
        let value;

        if (type == 'email') {

            name = 'userGetMsgToEmail';
            value = this.form.userGetMsgToEmail;

            this.presentToast();

            this.http.post(this.api.url + '/user/settings/' + name + '/' + value, {}, this.api.setHeaders(true)).subscribe(data => {
            });

        } else if (type == 'push') {
            name = 'newMessPushNotif';
            value = this.form.newMessPushNotif;

            this.presentToast();

            this.http.post(this.api.url + '/user/settings/' + name + '/' + value, {}, this.api.setHeaders(true)).subscribe(data => {
            });
        } else if ('fingerprint') {
            if (this.form.fingerprint == true) {
                this.storage.set('enableFingerAuth', '1');
            } else {
                this.storage.set('enableFingerAuth', '0');
            }
        }


    }

    ionViewDidLoad() {
        this.api.pageName = 'SettingsPage';
        console.log('ionViewDidLoad SettingsPage');
    }

}
