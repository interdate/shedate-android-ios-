import {Component} from "@angular/core";
import {Headers, RequestOptions, Http} from "@angular/http";
import {AlertController, ToastController, LoadingController, Platform, ModalController} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {DomSanitizer} from "@angular/platform-browser";
import {Geolocation} from "@ionic-native/geolocation";
import {Keyboard} from "@ionic-native/keyboard";
import * as $ from "jquery";


@Component({
    templateUrl: 'api.html'
})
export class ApiQuery {

    public url: any;
    public header: RequestOptions;
    public response: any;
    public username: any;
    public password: any;
    public status: any = '';
    public back: any = false;
    public storageRes: any;
    public footer: any = true;
    public pageName: any = false;
    public loading: any;
    public banner: {src: string; link: string};
    public isActivated: boolean = true;
    public callAlertShow:any = false;
    public videoChat: any = null;
    public videoTimer: any = null;
    public isPay: any;
    public callAlert: any;
    public audioCall: any;
    public audioWait: any;
    public videoShow: any = false;
    public signupData: {  username: any, password: any };

    constructor(public storage: Storage,
                public alertCtrl: AlertController,
                public http: Http,
                public loadingCtrl: LoadingController,
                private sanitizer: DomSanitizer,
                public toastCtrl: ToastController,
                public modalCtrl: ModalController,
                private geolocation: Geolocation,
                public keyboard: Keyboard,
                public plt: Platform) {
        //this.url = 'http://10.0.0.6:8100';
        this.url = 'http://localhost:8100';
        //this.url = 'https://m.shedate.co.il/api/v8';

        this.storage.get('user_id').then((val) => {
            this.storage.get('username').then((username) => {
                this.username = username;
            });
            this.storage.get('password').then((password) => {
                this.password = password;
            });
        });
    }

    safeHtml(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    sendPhoneId(idPhone) {
        let data = JSON.stringify({deviceId: idPhone});
        let os = (this.plt.is('IOS')) ? 'iOS' : 'Android';
        this.http.post(this.url + '/user/deviceId/OS:' + os, data, this.setHeaders(true)).subscribe(data => {
        });
    }

    setUserData(data) {
        this.setStorageData({label: 'username', value: data.username});
        this.setStorageData({label: 'password', value: data.password});
    }

    /**
     *  Set User's Current Location
     */
    setLocation() {
        this.geolocation.getCurrentPosition().then((pos) => {
            let params = JSON.stringify({
                latitude: ''+pos.coords.latitude+'',
                longitude: ''+pos.coords.longitude+''
            });

            this.http.post(this.url + '/user/location', params, this.setHeaders(true)).subscribe(data => {
            });
        }, err => console.log(err));
    }

    setStorageData(data) {
        this.storage.set(data.label, data.value);
    }

    openVideoChat(param){
        this.storage.get('user_id').then((id) => {
            if(this.callAlert && this.callAlert != null) {
                this.callAlert.dismiss();
                this.callAlert = null;
            }
            this.playAudio('call');

            this.http.post(this.url + '/user/call/' + param.id,{message: 'call', id: param.chatId}, this.setHeaders(true)).subscribe((res:any) => {

                this.stopAudio();

                if(res.json().error != '') {
                    let toast = this.toastCtrl.create({
                        message: res.json().error,
                        showCloseButton: true,
                        closeButtonText: 'אישור'
                    });

                    toast.present();
                } else {
                    // /user/call/push/
                    if(res.json().call.sendPush) {
                        this.http.post(this.url + '/user/call/push/' + param.id, {}, this.setHeaders(true)).subscribe((data: any) => {});
                    }
                    param.chatId = res.json().call.msgId;
                    $('#close-btn,#video-iframe').remove();
                    const closeButton = document.createElement('button');
                    closeButton.setAttribute('id', 'close-btn');
                    closeButton.style.backgroundColor = 'transparent';
                    closeButton.style.margin = '0 10px';
                    closeButton.style.width = '40px';
                    closeButton.style.height = '40px';
                    closeButton.style['font-size'] = '0px';
                    closeButton.style['text-align'] = 'center';
                    closeButton.style.background = 'url(https://www.shedate.co.il/images/video/buzi_b.png) no-repeat center';
                    closeButton.style['background-size'] = '100%';
                    closeButton.style.position = 'absolute';
                    closeButton.style.bottom = '10px';
                    closeButton.style.left = 'calc(50% - 25px)';
                    closeButton.style.zIndex = '9999';
                    closeButton.onclick = (e) => {
                        console.log('close window');
                        $('#close-btn,#video-iframe').remove();
                        this.http.post(this.url + '/user/call/' + param.id,{message: 'close', id: param.chatId}, this.setHeaders(true)).subscribe((data:any) => {
                            // let res = data.json();
                        });
                        this.videoChat = null;
                    };

                    this.videoChat = document.createElement('iframe');
                    this.videoChat.setAttribute('id', 'video-iframe');
                    this.videoChat.setAttribute('src', 'https://www.shedate.co.il/video.html?id='+id+'&to='+param.id);
                    this.videoChat.setAttribute('allow','camera; microphone');
                    this.videoChat.style.position = 'absolute';
                    this.videoChat.style.top = '0';
                    this.videoChat.style.left = '0';
                    this.videoChat.style.boxSizing = 'border-box';
                    this.videoChat.style.width = '100vw';
                    this.videoChat.style.height = '101vh';
                    this.videoChat.style.backgroundColor = 'transparent';
                    this.videoChat.style.zIndex = '999';
                    this.videoChat.style['text-align'] = 'center';

                    document.body.appendChild(this.videoChat);
                    document.body.appendChild(closeButton);
                    if(param.alert == false) {
                        this.checkVideoStatus(param);
                    }
                }
            }, error => {
                this.stopAudio();
            });
        });
    }

    playAudio(audio) {
        if(this.callAlertShow == false) {
            this.showLoad();
        }
        if(audio == 'call') {
            this.audioCall.play();
            this.audioCall.loop = true;
        } else {
            this.audioWait.play();
            this.audioWait.loop = true;
        }
    }

    stopAudio() {
        this.audioCall.pause();
        this.audioCall.currentTime = 0;
        this.audioWait.pause();
        this.audioWait.currentTime = 0;
        this.hideLoad();
    }

    checkVideoStatus(param){

        this.http.get(this.url + '/user/call/status/' + param.chatId, this.setHeaders(true)).subscribe((res: any) => {

            this.status = res.json().status;
            if (res.json().status == 'answer') {
            }
            if (res.json().status == 'close' || res.json().status == 'not_answer') {
                this.stopAudio();
                if (this.videoChat != null || this.callAlert != null) {

                    let toast = this.toastCtrl.create({
                        message: (this.status == 'not_answer' && this.videoChat && this.videoChat != null) ? ('השיחה עם ' + param.username + ' נדחתה') : 'השיחה הסתיימה',
                        showCloseButton: true,
                        closeButtonText: 'אישור'
                    });
                    toast.present();
                }
                if(this.callAlert && this.callAlert != null) {
                    this.callAlert.dismiss();
                    this.callAlert = null;
                }
                if(this.videoChat && this.videoChat != null) {
                    $('#close-btn,#video-iframe').remove();
                    this.videoChat = null;
                }
            }

            if (this.videoChat != null || this.callAlert != null) {
                let that = this;
                setTimeout(function () {
                    that.checkVideoStatus(param)
                }, 3000);
            }
        });

    }

    showLoad(txt = 'אנא המתיני...') {

        this.loading = this.loadingCtrl.create({
            content: txt
        });

        this.loading.present();
    }

    functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
            if (arraytosearch[i][key] == valuetosearch) {
                return i;
            }
        }
        return null;
    }

    hideLoad() {
        if (!this.isLoaderUndefined())
            this.loading.dismiss();
        this.loading = undefined;
    }

    isLoaderUndefined(): boolean {
        return (this.loading == null || this.loading == undefined);
    }

    getUserData() {
        this.storage.get('user_id').then((val) => {
            this.storage.get('username').then((username) => {
                this.username = username;
            });
            this.storage.get('password').then((password) => {
                this.password = password;
            });
        });
        return {username: this.username, password: this.password}
    }

    setHeaders(is_auth = false, username = false, password = false, register = "0") {

        if (username != false) {
            this.username = username;
        }

        if (password != false) {
            this.password = password;
        }

        let myHeaders: Headers = new Headers;

        myHeaders.append('Content-type', 'application/json');
        myHeaders.append('Accept', '*/*');
        myHeaders.append('Access-Control-Allow-Origin', '*');

        if (is_auth == true) {
            myHeaders.append("Authorization", "Basic " + btoa(encodeURIComponent(this.username) + ':' + encodeURIComponent(this.password)));
            /*@encodeURIComponent(this.username)*/
        }
        this.header = new RequestOptions({
            headers: myHeaders
        });
        return this.header;
    }

    ngAfterViewInit() {

        this.storage.get('user_id').then((val) => {
            this.storage.get('username').then((username) => {
                this.username = username;
            });
            this.storage.get('password').then((password) => {
                this.password = password;
            });
        });
    }
}
