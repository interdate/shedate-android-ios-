import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams, LoadingController, ToastController, AlertController} from "ionic-angular";
import {HomePage} from "../home/home";
import {ApiQuery} from "../../library/api-query";
import {Storage} from "@ionic/storage";
import {Http, Headers, RequestOptions, Response} from "@angular/http";
import {AndroidFingerprintAuth} from "@ionic-native/android-fingerprint-auth";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import {RegisterPage} from "../register/register";
import * as $ from "jquery";

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';


/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    providers: [Facebook]
})
export class LoginPage {

    form: any;
    errors: any;
    header: RequestOptions;
    user: any = {id: '', name: ''};
    fingerAuth: any;
    enableFingerAuth: any;
    disableFingerAuthInit: any;
    fbId: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public http: Http,
                public api: ApiQuery,
                public storage: Storage,
                public loadingCtrl: LoadingController,
                public toastCtrl: ToastController,
                private androidFingerprintAuth: AndroidFingerprintAuth,
                // private googlePlus: GooglePlus,
                private fb: Facebook,
                public alertCtrl: AlertController
                ) {

        this.http.get(api.url + '/user/form/login/', api.setHeaders(false)).subscribe(data => {
            this.form = data.json();
            this.storage.get('username').then((username) => {
                this.form.login.username.value = username;
                this.user.name = username;
            });

           /* this.storage.remove('fingerAuth');
             this.storage.remove('enableFingerAuth');
             this.storage.remove('disableFingerAuthInit');*/

            let that = this;
            setTimeout(function () {
                that.storage.get('fingerAuth').then((val) => {
                    if (val) {
                        that.fingerAuth = val;
                    }
                });
            }, 10);
        });

        this.storage = storage;

        if (navParams.get('page') && navParams.get('page')._id == "logout") {

            this.api.setHeaders(false, null, null);
            // Removing data storage
            this.storage.remove('status');
            this.storage.remove('password');
            this.storage.remove('user_id');
            this.storage.remove('user_photo');
        }

        if(navParams.get('error')){
            this.errors = navParams.get('error');
        }
    }

    formSubmit() {


        let data = {};
        if(this.fbId) {
             data = {
                facebook_id: this.fbId
            }
        }

        this.http.post(this.api.url + '/user/login/', data, this.setHeaders()).map((res: Response) => res.json()).subscribe(data => { //.map((res: Response) => res.json())
            console.log(data);


            setTimeout(function () {
                this.errors = 'משתמש זה נחסם על ידי הנהלת האתר';
            }, 300);

            this.validate(data);

        }, err => {
            //console.log(err.status);
            this.errors = err.text();
        });
    }

    setHeaders() {
        let myHeaders: Headers = new Headers;
        myHeaders.append('Content-type', 'application/json');
        myHeaders.append('Accept', '*/*');
        myHeaders.append('Access-Control-Allow-Origin', '*');
        myHeaders.append("Authorization", "Basic " + btoa(encodeURIComponent(this.form.login.username.value) + ':' + encodeURIComponent(this.form.login.password.value)));

        this.header = new RequestOptions({
            headers: myHeaders
        });
        return this.header;
    }

    fingerAuthentication(data) {

        if (typeof data.status == 'undefined') {
            data = {status: 'login', username: this.form.login.username.value}
        }

        this.storage.get('enableFingerAuth').then((enableFingerAuth) => {

            if (enableFingerAuth && enableFingerAuth == 1) {
                this.enableFingerAuth = 1;
            } else {
                this.enableFingerAuth = 0;
            }
        });

        this.storage.get('disableFingerAuthInit').then((disableFingerAuthInit) => {

            if (disableFingerAuthInit && disableFingerAuthInit == 1) {
                this.disableFingerAuthInit = 1;
            } else {
                this.disableFingerAuthInit = 0;
            }
        });

        this.storage.get('fingerAuth').then((val) => {

            if ((data.status == 'init' && !val && this.disableFingerAuthInit == 0) || (this.enableFingerAuth == 1 && !val )) {

                this.androidFingerprintAuth.isAvailable()
                    .then((result)=> {

                        if (result.isAvailable) {

                            // it is available
                            this.androidFingerprintAuth.encrypt({
                                clientId: 'com.interdate.shedate',
                                username: data.username,
                                password: data.password,
                                dialogTitle: 'כניסה לשידייט באמצעות טביעת אצבע',
                                dialogMessage: 'אשרי טביעת אצבע כדי להמשיך',
                                dialogHint: 'חיישן מגע'
                            })
                                .then(result => {

                                    this.storage.set('fingerAuthLogin', data.username);
                                    if (result.withFingerprint) {
                                        //alert('Successfully encrypted credentials.');
                                        //alert('Encrypted credentials: ' + result.token);
                                        this.storage.set('fingerAuth', result.token);

                                    } else if (result.withBackup) {
                                        //alert('Successfully authenticated with backup password!');
                                        //alert('Encrypted credentials: ' + result.token);
                                        this.storage.set('fingerAuth', result.token);

                                    } else alert('Didn\'t authenticate!');

                                })
                                .catch(error => {
                                    //alert(JSON.stringify(error))
                                    this.storage.set('disableFingerAuthInit', '1');
                                });

                        } else {
                            // fingerprint auth isn't available
                        }
                    })
                    .catch(error => console.error(error));
            } else if (val && data.status == 'login') {
                this.androidFingerprintAuth.isAvailable()
                    .then((result)=> {
                        if (result.isAvailable) {
                            this.androidFingerprintAuth.decrypt({
                                clientId: 'com.interdate.shedate',
                                //username: data.username,
                                token: val,
                                dialogTitle: 'כניסה לשידייט באמצעות טביעת אצבע',
                                locale: "hb",
                                dialogMessage: 'אשרי טביעת אצבע כדי להמשיך',
                                dialogHint: 'חיישן מגע'
                            }).then(result => {
                                //alert('token: '+ val + 'decrypt:'+ JSON.stringify(result));
                                //alert('password'+ JSON.stringify(result.password));
                                //alert(JSON.stringify(result));

                                this.storage.get('fingerAuthLogin').then((val) => {
                                    this.user.name = val;
                                    this.form.login.password.value = result.password;
                                    this.formSubmit();
                                });

                            }).catch(error => {
                                this.storage.remove('fingerAuth');
                                this.storage.remove('enableFingerAuth');
                                this.storage.remove('disableFingerAuthInit');
                                this.storage.remove('fingerAuthLogin');
                                this.navCtrl.popToRoot();
                            });
                        }
                    });
            }
        });
    }




    validate(response) {

        if (response.status != "not_activated") {
            this.storage.set('username', response.userNick);
            this.storage.set('password', this.form.login.password.value);
            this.storage.set('status', response.status);
            this.storage.set('user_id', response.id);
            this.storage.set('user_photo', response.photo);

            this.api.setHeaders(true, response.userNick, this.form.login.password.value);
        }
        if (response.status == "login") {
            let data = {
                status: 'init',
                username: response.userNick,
                password: this.form.login.password.value
            };
            this.fingerAuthentication(data);

            this.storage.set('user_photo', response.photo);
            this.navCtrl.setRoot(HomePage, {
                params: 'login',
                username: response.userNick,
                password: this.form.login.password.value
            });

        } else if (response.status == "no_photo") {
            this.user.id = response.id;

            let toast = this.toastCtrl.create({
                message: response.texts.photoMessage,
                showCloseButton: true,
                closeButtonText: 'אישור'
            });

            toast.present();
            this.navCtrl.push('RegisterPage', {
                user: this.user,
                username: this.form.login.username.value,
                password: this.form.login.password.value
            });
        } else if (response.status == "not_activated") {
            let toast = this.toastCtrl.create({
                message: response.texts.notActiveMessage,
                showCloseButton: true,
                closeButtonText: 'אישור'
            });
            toast.present();
            this.navCtrl.push(LoginPage);
        }
        this.storage.get('deviceToken').then((deviceToken) => {
            this.api.sendPhoneId(deviceToken);
        });
    }

    onRegistrationPage() {
        this.navCtrl.push(RegisterPage);
    }

    onPasswordRecoveryPage() {
        this.navCtrl.push('PasswordRecoveryPage');
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad LoginPage');
    }

    ionViewWillEnter() {
        this.api.pageName = 'LoginPage';
        $('.back-btn').hide();
    }



    loginFB() {
        this.fb.getLoginStatus().then((
            res: FacebookLoginResponse) => {
            console.log('Logged into Facebook!', res);
            // alert(JSON.stringify(res));
            if(res.status == 'connected') {
                this.getFBData(res);
            }else{
                this.fb.login(['email','public_profile']).then((
                    fbres: FacebookLoginResponse) => {
                    console.log('Logged into Facebook!', fbres);
                    this.getFBData(fbres);
                }).catch(e => console.log('Error logging into Facebook', e));
            }
        }).catch(e => console.log('Error logging into Facebook', e));
    }

    getFBData(status) {
        this.fb.api('/me?fields=email,gender,id', ['email','public_profile']).then(
            res => {
                this.checkBFData(res);
                // alert(JSON.stringify(res))
            }).catch(e => console.log('Error getData into Facebook '+ e));
    }

    checkBFData(fbData) {
        console.log(fbData);
        this.form.login.username.value = '';
        this.form.login.password.value = '';
        let postData = JSON.stringify({facebook_id: fbData.id});
        this.api.http.post(this.api.url + '/user/login/', postData, this.setHeaders()).subscribe((data: any) => {
            console.log(data);
            data = data.json();
            if (data.user.login == '1') {
                this.storage.set('username', data.user.username);
                this.storage.set('password', data.user.password);
                this.storage.set('status', data.status);
                this.storage.set('user_id', data.user.user_id);
                this.storage.set('user_photo', data.user.photo);

                let fingerData = {
                    status: 'init',
                    username: data.user.username,
                    password: data.user.password,
                };
                this.fingerAuthentication(fingerData);

                this.storage.set('user_photo', data.user.photo);
                this.navCtrl.setRoot(HomePage, {
                    params: 'login',
                    username: data.user.username,
                    password: data.user.password,
                }).then(res => {
                    console.log(res)
                }).catch(err => console.log(err));


                this.api.setHeaders(true, data.user.username, data.user.password);
                let that = this;
                // setTimeout( () => {
                 that.navCtrl.push(HomePage);
                // }, 5000 );
                this.api.storage.get('deviceToken').then((deviceToken) => {
                    if (deviceToken) this.api.sendPhoneId(deviceToken);
                });
            }
        }, (err: any) => {
                this.alertCtrl.create({
                    title: this.form.facebook.pop_header,
                    message: this.form.facebook.pop_message,
                    buttons: [
                        {
                            text: this.form.facebook.pop_button,
                            handler: () => {
                                let data = JSON.stringify({
                                    userEmail: fbData.email,
                                    facebook_id: fbData.id
                                });
                                this.navCtrl.push(RegisterPage, {user: data})
                            }
                        },
                        {
                            text: this.form.facebook.pop_cancel,
                            role: 'cancel',
                            handler: () => this.fbId = fbData.id
                        }
                    ]
                }).present();


        });
    }

    test() {

        this.checkBFData({id: 123});
        // const user = JSON.stringify({
        //     facebook_id: 123,
        //     userEmail: 'test@interdate.co.il'
        // })
        //
        // this.navCtrl.push(RegisterPage, {user: user});
    }

}




