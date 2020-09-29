import {Component, ViewChild} from "@angular/core";
import {
    NavController,
    NavParams,
    Nav,
    ToastController,
    Content,
    LoadingController,
    AlertController
} from "ionic-angular";
import {Http} from "@angular/http";
import {ApiQuery} from "../../library/api-query";
import {Storage} from "@ionic/storage";
declare var $: any;
/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html',
})
export class ProfilePage {
    @ViewChild(Content) content: Content;
    @ViewChild(Nav) nav: Nav;

    isAbuseOpen: any = false;

    user: any = {};

    photos: any = [];

    texts: { lock: any, unlock: any } = {lock: '', unlock: ''};

    formReportAbuse: { title: any, buttons: { cancel: any, submit: any }, text: { label: any, name: any, value: any } } =
    {title: '', buttons: {cancel: '', submit: ''}, text: {label: '', name: '', value: ''}};

    myId: any = false;

    imageClick: boolean = false;


    constructor(public toastCtrl: ToastController,
                public navCtrl: NavController,
                public navParams: NavParams,
                public http: Http,
                public loadingCtrl: LoadingController,
                public api: ApiQuery,
                public alertCtrl: AlertController,
                public storage: Storage) {

        this.storage = storage;

        let loading = this.loadingCtrl.create({
            content: 'אנא המתיני...'
        });

        //loading.present();

        var user = navParams.get('user');

        if (user) {
            if ((user.photo || user.imageUrl) && !user.photos) {
                let url = (user.photo) ? user.photo : user.imageUrl;
                user.photos = [{url: url,large: url.replace('h_600,w_600','h_800,w_800')}];
            }
            this.user = user;
            this.photos = this.user.photos;
            //console.log(this.photos);

            this.http.get(api.url + '/user/profile/' + this.user.id, api.setHeaders(true)).subscribe(data => {
                this.user = data.json();
                if (this.photos.length < this.user.photos.length) {
                    for (let i = 0; i < this.user.photos.length; i++) {
                        if (i > 0) {
                            this.photos.push(this.user.photos[i]);
                        }
                    }
                }

                //this.user.mainImage.url = this.user.photos[0];
                this.formReportAbuse = data.json().formReportAbuse;
                this.texts = data.json().texts;
                loading.dismiss();
                this.imageClick = true;
                this.backBtn();
            });
        } else {

            this.storage.get('user_id').then((val) => {
                //alert(val);
                if (val) {
                    this.myId = val;
                    this.http.get(api.url + '/user/profile/' + this.myId, api.setHeaders(true)).subscribe(data => {
                        this.user = data.json();
                        // if (this.photos.length < this.user.photos.length) {
                        //     for (let i = 0; i < this.user.photos.length; i++) {
                        //         //if (i > 0) {
                        //             this.photos.push(this.user.photos[i]);
                        //         //}
                        //     }
                        // }
                        this.photos = this.user.photos;
                        this.formReportAbuse = data.json().formReportAbuse;
                        this.texts = data.json().texts;
                        loading.dismiss();
                        this.imageClick = true;
                        this.backBtn();
                    });
                }
            });
        }

    }

    setHtml(id, html) {
        if ($('#' + id).html() == '' && html != '') {
            let div: any = document.createElement('div');
            div.innerHTML = html;
            /*
             [].forEach.call(div.getElementsByTagName("a"), (a) => {
             var pageHref = a.getAttribute('onclick');
             if (pageHref) {
             a.removeAttribute('onclick');
             a.onclick = () => this.getPage(pageHref);
             }
             });*/
            $('#' + id).append(div);
        }
    }

    scrollToBottom() {
        this.content.scrollTo(0, this.content.getContentDimensions().scrollHeight, 300);
    }


    addFavorites(user) {
        let params, url;

        if (user.isAddFavorite == '0') {
            this.user.isAddFavorite = '1';
            //user.isAddFavorite = '1';
            params = JSON.stringify({
                list: 'Favorite'
            });

            url = this.api.url + '/user/managelists/favi/1/' + user.id;

        } else {
            this.user.isAddFavorite = '0';
            //user.isFav = '0';
            params = JSON.stringify({
                list: 'Unfavorite'
            });

            url = this.api.url + '/user/managelists/favi/0/' + user.id;
        }

        this.api.http.post(url, params, this.api.setHeaders(true)).subscribe((data: any) => {
            let toast = this.toastCtrl.create({
                message: data.json().success,
                duration: 3000
            });

            toast.present();
        });
    }

    blockSubmit() {
        var action;
        if (this.user.isAddBlackListed == true) {
            this.user.isAddBlackListed = false;
            action = 'delete';
        } else {
            this.user.isAddBlackListed = true;
            action = 'create';
        }

        let params = JSON.stringify({
            list: 'BlackList',
            action: action
        });

        var act = this.user.isAddBlackListed == 1 ? 1 : 0;

        this.http.post(this.api.url + '/user/managelists/black/' + act + '/' + this.user.id, params, this.api.setHeaders(true)).subscribe(data => {
            let toast = this.toastCtrl.create({
                message: data.json().success,
                duration: 3000
            });

            toast.present();

        });
    }

    addLike(user) {

        let alert = this.alertCtrl.create({
            title: 'האם את בטוחה?',
            buttons: [
                {
                    text: 'לֹא',
                    role: 'cancel'
                },
                {
                    text: 'כן',
                    handler: data => {
                        user.isAddLike = true;
                        let toast = this.toastCtrl.create({
                            message: ' עשית לייק ל' + user.userNick,
                            duration: 2000
                        });

                        toast.present();

                        let params = JSON.stringify({
                            toUser: user.id,
                        });

                        this.http.post(this.api.url + '/user/like/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
                            console.log(data);
                        }, err => {
                            console.log("Oops!");
                        });
                    }
                }
            ]
        });
        alert.present();
    }

    toVideoChat() {
        this.api.openVideoChat({id: this.user.id, chatId: 0, alert: false, username: this.user.userrNick});
    }

    fullPagePhotos(i) {

        if (this.user.photos[0].url != 'http://www.shedate.co.il/images/users/small/0.jpg') {
            this.navCtrl.push('FullScreenProfilePage', {
                user: this.user,
                i: i
            });
        }
    }

    toDialog(user) {
        this.navCtrl.push('DialogPage', {
            user: user
        });
    }

    reportAbuseShow() {
        this.isAbuseOpen = true;
        this.scrollToBottom();
    }

    reportAbuseClose() {
        this.isAbuseOpen = false;
        this.formReportAbuse.text.value = "";
    }

    abuseSubmit() {

        let params = JSON.stringify({
            text: this.formReportAbuse.text.value,
        });

        this.http.post(this.api.url + '/user/abuse/' + this.user.id, params, this.api.setHeaders(true)).subscribe(data => {

            let toast = this.toastCtrl.create({
                message: 'הודעתך נשלחה בהצלחה להנהלת האתר',
                duration: 2000
            });

            toast.present();
        }, err => {
            console.log("Oops!");
        });
        this.reportAbuseClose();
    }


    ionViewWillLeave() {
        $('.back-btn').hide();
    }

    backBtn() {
        this.api.pageName = 'ProfilePage';
        $('.back-btn').show();
    }

}
