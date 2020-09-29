import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, LoadingController, ToastController, Events, InfiniteScroll, AlertController} from 'ionic-angular';
import {Http} from '@angular/http';
import {Storage} from '@ionic/storage';
import {ApiQuery} from '../../library/api-query';
import {ProfilePage} from "../profile/profile";
import {ActivationPage} from "../activation/activation";
import {DialogPage} from "../dialog/dialog";
// import {ActivationPage} from "../activation/activation";
declare var $: any;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    @ViewChild(InfiniteScroll) scroll: InfiniteScroll;

    public options: { filter: any } = {filter: 1};
    list: any;
    action: any;
    offset: any;
    page_counter: any;
    loader: any = true;
    username: any;
    password: any;
    blocked_img: any = false;
    user_counter: any = 0;
    form_filter: any;
    filter: any; //= {filter: '', visible: ''}
    users: any;//Array<{ id: string, isOnline: string, isAddBlackListed: string, nickName: string, photo: string, age: string, region_name: string, image: string, about: {}, component: any}>;
    texts: { like: string, add: string, message: string, remove: string, unblock: string, no_results: string };
    params: { action: any, filter: any, page: any, list: any, searchparams: any }
        = {
        action: 'online',
        filter: 'new',
        page: 1,
        list: '',
        searchparams: {region: '', agefrom: 0, ageto: 0, sexpreef: '', meritalstat: '', userNick: ''}
    };
    params_str: any;
    scrolling = false;
    selectOptions = {title: 'popover select'};

    constructor(public toastCtrl: ToastController,
                public loadingCtrl: LoadingController,
                public navCtrl: NavController,
                public navParams: NavParams,
                public http: Http,
                public api: ApiQuery,
                public alertCtrl: AlertController,
                public events: Events,
                public storage: Storage) {

        this.api.audioCall = new Audio();
        this.api.audioCall.src = 'https://m.richdate.co.il/phone_ringing.mp3';
        this.api.audioCall.loop = true;
        this.api.audioCall.load();
        this.api.audioWait = new Audio();
        this.api.audioWait.src = 'https://m.richdate.co.il/landline_phone_ring.mp3';
        this.api.audioWait.loop = true;
        this.api.audioWait.load();


        if (navParams.get('params') && navParams.get('params') != 'login') {

            if (navParams.get('action')) {
                this.params_str = {
                    action: 'list',
                    list: navParams.get('params').list,
                    page: 1
                }
            }

            console.log(navParams.get('params').list);


            this.params_str = navParams.get('params');
            this.params = JSON.parse(this.params_str);
        }

        if (!navParams.get('params') || navParams.get('params') == 'login') {
            this.api.setLocation();
        }

        this.params_str = JSON.stringify(this.params);

        // If Current Page Is "Block" or "Favorited", than remove "Add Favorited"
        if (this.params.list == 'black' || this.params.list == 'fav') {
            this.blocked_img = true;
        }

        this.page_counter = 1;

        this.storage.get('username').then((username) => {
            this.storage.get('password').then((password) => {
                this.password = password;
                this.username = username;
                this.getUsers();
            });
        });


        //this.getLocation();
    }

    itemTapped(user) {
        this.navCtrl.push(ProfilePage, {
            user: user
        });
    }

    filterStatus() {
        if (this.options.filter == 1) {
            this.options.filter = 0;
        } else {
            this.options.filter = 1;
        }
    }

    toDialog(user) {
        this.navCtrl.push(DialogPage, {
            user: user
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
                        if (user.isLike == false) {

                            user.isLike = true;

                            let toast = this.toastCtrl.create({
                                message: ' עשית לייק ל' + user.userNick,
                                duration: 5000
                            });

                            toast.present();

                            let params = JSON.stringify({
                                toUser: user.id,
                            });

                            this.http.post(this.api.url + '/user/like/' + user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
                            }, err => {
                                console.log("Oops!");
                            });
                        }
                    }
                }
            ]
        });
        alert.present();
    }

    block(user, bool) {

        let toast;
        let params;

        if (user.isAddBlackListed == false && bool == true) {

            user.isAddBlackListed = true;


            params = JSON.stringify({
                list: 'Favorite',
                action: 'delete'
            });

        } else if (user.isAddBlackListed == true && bool == false) {

            user.isAddBlackListed = false;

            params = JSON.stringify({
                list: 'BlackList',
                action: 'delete'
            });
        }

        if (this.users.length == 1) {
            this.user_counter = 0;
        }

        // Remove user from list
        this.users.splice(this.users.indexOf(user), 1);
        this.events.publish('statistics:updated');


        this.http.post(this.api.url + '/user/managelists/black/0/' + user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {

            toast = this.toastCtrl.create({
                message: data.json().success,
                duration: 3000
            });
            toast.present();
        });
    }

    unFavorites(user) {

        let params = JSON.stringify({
            list: 'Unfavorite'
        });

        this.http.post(this.api.url + '/user/managelists/favi/0/' + user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
            let toast = this.toastCtrl.create({
                message: data.json().success,
                duration: 3000
            });

            console.log(this.users);

            toast.present();
            this.users.splice(this.users.indexOf(user), 1);
            this.events.publish('statistics:updated');
        });

    }

    addFavorites(user) {
        let params, url;
        let index = this.users.indexOf(user);
        if (this.params.list == 'fav') {
            this.users.splice(index, 1);
        }


        if (user.isFav == '0') {
            this.users[index].isFav = '1';
            user.isFav = '1';
            params = JSON.stringify({
                list: 'Favorite'
            });

            url = this.api.url + '/user/managelists/favi/1/' + user.id;

        } else {

            this.users[index].isFav = '0';
            user.isFav = '0';
            params = JSON.stringify({
                list: 'Unfavorite'
            });

            url = this.api.url + '/user/managelists/favi/0/' + user.id;
        }

        this.api.http.post(url, params, this.api.setHeaders(true, this.username, this.password)).subscribe((data: any) => {
            let toast = this.toastCtrl.create({
                message: data.json().success,
                duration: 3000
            });

            toast.present();
            this.events.publish('statistics:updated');
        });
    }

    sortBy() {

        console.log(JSON.stringify(this.params.searchparams));

        let params = JSON.stringify({
            action: 'search',
            list: '',
            filter: this.filter,
            page: 1,
            searchparams: {
                region: this.params.searchparams.region,
                agefrom: this.params.searchparams.agefrom,
                ageto: this.params.searchparams.ageto,
                sexpreef: this.params.searchparams.sexpreef,
                meritalstat: this.params.searchparams.meritalstat,
                userNick: this.params.searchparams.userNick
            }

        });

        if (this.params.list) {
            params = JSON.stringify({
                action: '',
                list: this.params.list,
                filter: this.filter,
                page: 1,
                searchparams: {
                    region: this.params.searchparams.region,
                    agefrom: this.params.searchparams.agefrom,
                    ageto: this.params.searchparams.ageto,
                    sexpreef: this.params.searchparams.sexpreef,
                    meritalstat: this.params.searchparams.meritalstat,
                    userNick: this.params.searchparams.userNick
                }
            })
        }

        this.navCtrl.push(HomePage, {
            params: params
        })
    }


    getUsers() {

        let loading = this.loadingCtrl.create({
            content: 'אנא המתיני...'
        });

        if (this.navParams.get('params') == 'login') {
            //loading.present();
            this.username = this.navParams.get('username');
            this.password = this.navParams.get('password');


            this.http.post(this.api.url + '/users/search/', this.params_str, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
                loading.dismiss();
                this.users = data.json().users;
                this.texts = data.json().texts;

                this.user_counter = data.json().users.length;
                this.form_filter = data.json().filters;
                this.filter = data.json().filter;
                if (data.json().users.length < 10) {
                    this.loader = false;
                }
                //this.setDistanceFormat();
            });
        } else {
            //alert(this.params_str);
            loading.present();
            this.http.post(this.api.url + '/users/search/', this.params_str, this.api.setHeaders(true)).subscribe(data => {
                loading.dismiss();
                this.users = data.json().users;
                this.texts = data.json().texts;
                this.user_counter = data.json().users.length;
                this.form_filter = data.json().filters;
                this.filter = data.json().filter;
                if (data.json().users.length < 10) {
                    this.loader = false;
                }
                //this.setDistanceFormat();
            }, () => {
                loading.dismiss();
            });
        }
    }


    moreUsers(infiniteScroll: any) {
        if (this.loader) {
            this.page_counter++;
            this.params.page = this.page_counter;
            this.params_str = JSON.stringify(this.params);

            this.http.post(this.api.url + '/users/search/', this.params_str, this.api.setHeaders(true)).subscribe(data => {
                if (data.json().users.length < 10) {
                    this.loader = false;
                }
                for (let person of data.json().users) {
                    this.users.push(person);
                }
                //this.setDistanceFormat();
            });

            infiniteScroll.complete();
        }
    }

    toVideoChat(user) {
        this.api.openVideoChat({id: user.id, chatId: 0, alert: false, username: user.userNick});
    }

    onScroll(event) {
        //this.scrolling = true;
        //this.scrolling = true;
        //$('.my-invisible-overlay').show();
        console.log('scroll');

    }

    endscroll(event) {
        var that = this;
        console.log('scrollend ' + this.scrolling);
        setTimeout(function () {
            //$('.my-invisible-overlay').hide();
            that.scrolling = false;
            console.log('scrollend');
        }, 4000);

    }

    ionViewWillEnter() {
        this.api.pageName = 'HomePage';

    }
}
