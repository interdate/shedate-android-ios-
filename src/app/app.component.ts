import {Component, ViewChild} from "@angular/core";
import {
    Platform,
    MenuController,
    Nav,
    ViewController,
    ToastController,
    Content,
    AlertController,
    Events, LoadingController
} from "ionic-angular";
import {Market} from "@ionic-native/market";
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Http } from "@angular/http";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { ApiQuery } from "../library/api-query";
import { Storage } from "@ionic/storage";
import { HomePage } from "../pages/home/home";
import { ActivationPage } from "../pages/activation/activation";
import { LoginPage } from "../pages/login/login";
import {RegisterPage} from "../pages/register/register";
import {ChangePhotosPage} from "../pages/change-photos/change-photos";
import {SettingsPage} from "../pages/settings/settings";
// import {InboxPage} from "../pages/inbox/inbox";
import {SubscriptionPage} from "../pages/subscription/subscription";
import {ProfilePage} from "../pages/profile/profile";
import { AppVersion } from '@ionic-native/app-version';
import { AndroidPermissions } from '@ionic-native/android-permissions';


declare var $: any;

@Component({
    templateUrl: 'app.html',
    providers: [Market, Push]

})
export class MyApp {
    //rootPage:any = LoginPage;

    @ViewChild(Nav) nav: Nav;
    @ViewChild(ViewController) viewCtrl: ViewController;
    @ViewChild(Content) content: Content;

    // make HelloIonicPage the root (or first) page
    rootPage: any;
    //rootPage = LoginPage;
    menu_items_logout: Array<{_id: string, icon: string, title: string, count: any, component: any}>;
    menu_items_login: Array<{_id: string, icon: string, title: string, count: any, component: any}> = [];
    menu_items: Array<{_id: string, icon: string, title: string, count: any, component: any}>;
    menu_items_settings: Array<{_id: string, icon: string, title: string, count: any, component: any}>;
    menu_items_contacts: Array<{_id: string, list: string, icon: string, title: string, count: any, component: any}>;
    menu_items_footer1: Array<{_id: string, src_img: string, list: string, icon: string, count: any, title: string, component: any}>;
    menu_items_footer2: Array<{_id: string, src_img: string, list: string, icon: string, title: string, count: any, component: any}>;

    activeMenu: string;
    username: any;
    back: string;
    isPaying: any = false;

    is_login: any = false;
    status: any = '';
    texts: any = {};
    new_message: any = '';
    message: any = {};
    avatar: string = '';
    stats: string = '';
    interval: any = true;
    social: any;
    pageCanEnterNotActivated: any = ['ActivationPage', 'LoginPage', 'ContactUsPage', 'PagePage'];

    constructor(public platform: Platform,
                public menu: MenuController,
                public splashScreen: SplashScreen,
                public appVersion: AppVersion,
                public http: Http,
                public statusBar: StatusBar,
                public api: ApiQuery,
                public storage: Storage,
                public toastCtrl: ToastController,
                public alertCtrl: AlertController,
                public events: Events,
                public market: Market,
                public loadingCtrl: LoadingController,
                public ap: AndroidPermissions,
                public push: Push) {

        // let status bar overlay webview

// set status bar to white
        //this.statusBar.styleBlackTranslucent();

        this.http.get(api.url + '/user/menu/', api.header).subscribe((data:any) => {
            this.social = data.json().social;
            let menu = data.json().menu;
            this.initMenuItems(menu);

            this.storage.get('user_id').then((val) => {

                if (!val) {
                    this.rootPage = LoginPage;
                    this.menu_items = this.menu_items_logout;
                } else {
                    this.menu_items = this.menu_items_login;
                    this.getBingo();
                    this.rootPage = HomePage;
                }
            });
        }, error => console.log('error ', error));

        this.closeMsg();
        const that = this;
        setInterval(function () {
            // let page = that.nav.getActive();

            if (!(that.api.pageName == 'LoginPage') && that.api.username != false && that.api.username != null) {
                that.getBingo();
                // New Message Notification
                that.getMessage();
                that.getStatistics();
            }
        }, 10000);
        this.initPushNotification();
        this.initializeApp();
        this.menu1Active();
        this.getAppVersion();

    }

    requestPermit() {
        this.ap.requestPermissions([this.ap.PERMISSION.CAMERA, this.ap.PERMISSION.RECORD_AUDIO]).then(
            result => {this.api.videoShow = false;},
            //result => {this.api.videoShow = true;},
            err => {this.api.videoShow = false;}
        );
    }

    getAppVersion() {
        this.http.get(this.api.url + '/open_api/version', this.api.header).subscribe(data => {


            if (this.platform.is('cordova')) {

                //alert(this.appVersion.getVersionCode());
                this.appVersion.getVersionNumber().then((s) => {
                    if (data.json().version != s) {
                        let prompt = this.alertCtrl.create({
                            title: data.json().title,
                            message: data.json().message,
                            cssClass: 'new-version',
                            buttons: [
                                {
                                    text: data.json().cancel,
                                    handler: data => {
                                        console.log('Cancel clicked');
                                    }
                                },
                                {
                                    text: data.json().update,
                                    handler: data => {
                                        window.open('market://details?id=com.interdate.shedate', '_system');
                                    }
                                }
                            ]
                        });
                        prompt.present();
                    }
                })
            }

        });
    }

    closeMsg() {
        this.new_message = '';
    }

    goBack() {
        this.nav.pop();
    }

    getStatistics() {

        this.storage.get('user_id').then((id) => {
            if (id) {

                // let page = this.nav.getActive();

                if (this.api.pageName == 'ChangePhotosPage') {
                    this.api.setHeaders(true, false, false, '1');
                } else {
                    this.api.setHeaders(true);
                }

                this.http.get(this.api.url + '/user/statistics/', this.api.setHeaders(true)).subscribe(data => {

                    let statistics = data.json().statistics;

                    this.isPaying = data.json().userIsPaying;

                    this.api.isActivated = data.json().isActivated;


                    this.menu_items_login.push();

                    this.menu_items[2].count = statistics.newNotificationsNumber;
                    this.menu_items[0].count = statistics.newMessagesNumber;

                    // Contacts Sidebar Menu
                    this.menu_items_contacts[0].count = statistics.looked;//viewed
                    this.menu_items_contacts[1].count = statistics.lookedme;//viewedMe
                    this.menu_items_contacts[2].count = statistics.contacted;//connected
                    this.menu_items_contacts[3].count = statistics.contactedme;//connectedMe
                    this.menu_items_contacts[4].count = statistics.fav;//favorited
                    this.menu_items_contacts[5].count = statistics.favedme;//favoritedMe
                    this.menu_items_contacts[6].count = statistics.black;//blacklisted
                    //Footer Menu
                    this.menu_items_footer2[2].count = statistics.newNotificationsNumber;
                    //this.menu_items_footer2[2].count = 0;
                    this.menu_items_footer1[3].count = statistics.newMessagesNumber;
                    this.menu_items_footer2[0].count = statistics.fav;//favorited
                    this.menu_items_footer2[1].count = statistics.favedme;//favoritedMe

                    //this.bannerStatus();
                    // First Sidebar Menu
                    /*this.menu_items[2].count = statistics.newNotificationsNumber;
                     this.menu_items[0].count = statistics.newMessagesNumber;*/
                }, err => {
                    //console.log('Statistics Error');
                    this.api.hideLoad();
                    if(err.status == 403 ){

                        this.api.setHeaders(false, null, null);
                        // Removing data storage
                        this.storage.remove('status');
                        this.storage.remove('password');
                        this.storage.remove('user_id');
                        this.storage.remove('user_photo');
                        this.nav.setRoot(LoginPage,{error:err['_body']});
                        this.nav.popToRoot();
                    }

                    //this.nav.push(this.rootPage);
                    //this.clearLocalStorage(); //*********************************** put a message *************************
                });
                    this.checkActivate()

            }
        });

        this.getMessage();
    }


    clearLocalStorage() {
        this.api.setHeaders(false, null, null);
        // Removing data storage
        this.storage.remove('status');
        this.storage.remove('password');
        this.storage.remove('user_id');
        this.storage.remove('user_photo');

        this.nav.push(LoginPage);
    }

    initMenuItems(menu) {

        this.back = menu.back;

        this.stats = menu.stats;

        this.menu_items_logout = [
            {_id: '', icon: 'log-in', title: menu.login, component: LoginPage, count: ''},
            {_id: 'blocked', icon: '', title: menu.forgot_password, component: 'PasswordRecoveryPage', count: ''},
            {_id: '', icon: 'mail', title: menu.contact_us, component: 'ContactUsPage', count: ''},
            {_id: '', icon: 'person-add', title: menu.join_free, component: RegisterPage, count: ''},
         /*   {_id: '', icon: 'ribbon', title: 'Fingerprint1', component: FingerprintPage, count: ''},
            {_id: '', icon: 'ribbon', title: 'Fingerprint2', component: Fingerprint2Page, count: ''},
            {_id: '', icon: 'ribbon', title: 'Fingerprint3', component: Fingerprint3Page, count: ''},*/
        ];

        this.menu_items = [
            {_id: 'inbox', icon: '', title: menu.inbox, component: 'InboxPage', count: ''},
            {_id: 'the_area', icon: '', title: menu.the_arena, component: 'ArenaPage', count: ''},
            {_id: 'notifications', icon: '', title: menu.notifications, component: 'NotificationsPage', count: ''},
            {_id: 'stats', icon: 'stats', title: menu.contacts, component: ProfilePage, count: ''},
            {_id: 'search', icon: '', title: menu.search, component: 'SearchPage', count: ''},
            {_id: '', icon: 'information-circle', title: 'שאלות נפוצות', component: 'FaqPage', count: ''},
        ];

        this.menu_items_login = [
            {_id: 'inbox', icon: '', title: menu.inbox, component: 'InboxPage', count: ''},
            {_id: 'the_area', icon: '', title: menu.the_arena, component: 'ArenaPage', count: ''},
            {_id: 'notifications', icon: '', title: menu.notifications, component: 'NotificationsPage', count: ''},
            {_id: 'stats', icon: 'stats', title: menu.contacts, component: ProfilePage, count: ''},
            {_id: 'search', icon: '', title: menu.search, component: 'SearchPage', count: ''},
            {_id: '', icon: 'information-circle', title: 'שאלות נפוצות', component: 'FaqPage', count: ''},
            {_id: '', icon: 'mail', title: menu.contact_us, component: 'ContactUsPage', count: ''},
            {_id: 'subscribe', icon: 'ribbon', title: 'רכישת מנוי', component: SubscriptionPage, count: ''},

        ];

        this.menu_items_settings = [
            {_id: 'edit_profile', icon: '', title: menu.edit_profile, component: RegisterPage, count: ''},
            {_id: 'edit_photos', icon: '', title: menu.edit_photos, component: ChangePhotosPage, count: ''},
            {_id: '', icon: 'person', title: menu.view_my_profile, component: ProfilePage, count: ''},
            {_id: 'change_password', icon: '', title: menu.change_password, component: 'ChangePasswordPage', count: ''},
            {_id: 'freeze_account', icon: '', title: menu.freeze_account, component: 'FreezeAccountPage', count: ''},
            {_id: 'settings', icon: '', title: menu.settings, component: SettingsPage, count: ''},
            {_id: '', icon: 'mail', title: menu.contact_us, component: 'ContactUsPage', count: ''},
            {_id: 'logout', icon: 'log-out', title: menu.log_out, component: LoginPage, count: ''}
        ];


        this.menu_items_contacts = [
            {_id: 'viewed', icon: '', title: menu.viewed, component: HomePage, list: 'looked', count: ''},
            {
                _id: 'viewed_me',
                icon: '',
                title: menu.viewed_me,
                component: HomePage,
                list: 'lookedMe',
                count: ''
            },
            {
                _id: 'contacted',
                icon: '',
                title: menu.contacted,
                component: HomePage,
                list: 'contacted',
                count: ''
            },
            {
                _id: 'contacted_me',
                icon: '',
                title: menu.contacted_me,
                component: HomePage,
                list: 'contactedMe',
                count: ''
            },
            {
                _id: 'favorited',
                icon: '',
                title: menu.favorited,
                component: HomePage,
                list: 'fav',
                count: ''
            },
            {
                _id: 'favorited_me',
                icon: '',
                title: menu.favorited_me,
                component: HomePage,
                list: 'favedMe',
                count: ''
            },
            {_id: 'blocked', icon: '', title: menu.blocked, component: HomePage, list: 'black', count: ''}
        ];

        this.menu_items_footer1 = [
            {
                _id: 'online',
                src_img: 'assets/img/icons/online.png',
                icon: '',
                list: 'online',
                title: menu.online,
                component: HomePage,
                count: ''
            },
            {
                _id: 'viewed',
                src_img: 'assets/img/icons/new-arena.png',
                icon: '',
                list: 'viewed',
                title: menu.the_arena,
                component: 'ArenaPage',
                count: ''
            },
            {
                _id: 'near-me',
                src_img: '',
                title: 'קרובות אלי',
                list: 'distance',
                icon: 'pin',
                component: HomePage,
                count: ''
            },
            {
                _id: 'inbox',
                src_img: 'assets/img/icons/inbox.png',
                icon: '',
                list: '',
                title: menu.inbox,
                component: 'InboxPage',
                count: ''
            },
        ];

        this.menu_items_footer2 = [
            {
                _id: '',
                src_img: 'assets/img/icons/favorited.png',
                icon: '',
                list: 'fav',
                title: menu.favorited,
                component: HomePage,
                count: ''
            },
            {
                _id: '',
                src_img: 'assets/img/icons/favorited_me.png',
                icon: '',
                list: 'favedMe',
                title: menu.favorited_me,
                component: HomePage,
                count: ''
            },
            {
                _id: 'notifications',
                src_img: 'assets/img/icons/notifications_ft.png',
                list: '',
                icon: '',
                title: menu.notifications,
                component: 'NotificationsPage',
                count: ''
            },
            {_id: '', src_img: 'assets/img/icons/search.png', icon: '', title: menu.search, list: '', component: 'SearchPage', count: ''},
        ];
    }

    menu1Active(bool = true) {
        this.activeMenu = 'menu1';
        this.menu.enable(true, 'menu1');
        this.menu.enable(false, 'menu2');
        this.menu.enable(false, 'menu3');
        if (bool) {
            this.menu.toggle();
        }
    }


    menu2Active() {
        this.activeMenu = 'menu2';
        this.menu.enable(false, 'menu1');
        this.menu.enable(true, 'menu2');
        this.menu.enable(false, 'menu3');
        this.menu.open();
    }


    menu3Active() {
        this.activeMenu = 'menu3';
        this.menu.enable(false, 'menu1');
        this.menu.enable(false, 'menu2');
        this.menu.enable(true, 'menu3');
        this.menu.toggle();
    }


    menuCloseAll() {
        if (this.activeMenu != 'menu1') {
            this.menu.toggle();
            this.activeMenu = 'menu1';
            this.menu.enable(true, 'menu1');
            this.menu.enable(false, 'menu2');
            this.menu.enable(false, 'menu3');
            this.menu.close();
            //this.menu.toggle();
        }
    }

    initializeApp() {
        // alert('in initializeApp');
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need
            this.statusBar.show();
            this.statusBar.styleBlackOpaque();
            this.statusBar.backgroundColorByName('black');

            /*setTimeout(function () {
                this.splashScreen.hide();
            },1000);*/

            this.ap.checkPermission(this.ap.PERMISSION.CAMERA).then(
                result => {
                    console.log(result);
                    if(result.hasPermission) {
                        this.ap.checkPermission(this.ap.PERMISSION.RECORD_AUDIO).then(
                            result => {
                                if(result.hasPermission) {
                                    //enable videocall
                                    //this.api.videoShow = true;
                                    this.api.videoShow = false;
                                }else{
                                    this.requestPermit();
                                }
                            },
                            err => {
                                this.requestPermit();
                            }
                        );
                    }else{
                        this.requestPermit();
                    }
                },
                err => {this.requestPermit();}
            );
        });

    }

    initPushNotification() {
        if (!this.platform.is('cordova')) {
            // alert("Push notifications not initialized. Cordova is not available - Run in physical device");
            return;
        }

        const options: PushOptions = {
            android: {
                senderID: "778112311036"
            },
            ios: {
                alert: 'true',
                badge: true,
                sound: 'false'
            },
            windows: {},
            browser: {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            }
        };

        const push2: PushObject = this.push.init(options);

        push2.on('registration').subscribe((data) => {
            this.storage.set('deviceToken', data.registrationId);
            this.api.sendPhoneId(data.registrationId);
            //TODO - send device token to server
        });

        push2.on('notification').subscribe((data) => {
            //let self = this;
            //if user using app and push notification comes
            if (data.additionalData.foreground == false) {
                this.storage.get('user_id').then((val) => {

                    let that = this;

                    setTimeout(function () {
                        if (val) {
                           // alert('test0' + JSON.stringify(val));

                            that.nav.push('InboxPage');
                        }
                    }, 300);

                });
            }
        });
    }

    swipeFooterMenu() {
        if ($('.more-btn').hasClass('menu-left')) {
            $('.more-btn').removeClass('menu-left');
            $('.more-btn .right-arrow').show();
            $('.more-btn .left-arrow').hide();

            $('.more-btn').parents('.menu-one').animate({
                'margin-right': '-92%'
            }, 1000);
        } else {
            $('.more-btn').addClass('menu-left');
            $('.more-btn .left-arrow').show();
            $('.more-btn .right-arrow').hide();
            $('.more-btn').parents('.menu-one').animate({
                'margin-right': '0'
            }, 1000);
        }
    }

    removeBackground() {
        $('#menu3, #menu2').find('ion-backdrop').remove();
    }

    getBanner() {
        if(this.api.pageName != 'ArenaPage' && this.api.pageName != 'SearchPage' && this.api.pageName != 'DialogPage' && this.api.pageName != 'AdvancedSearchPage') {
            this.http.get(this.api.url + '/user/banner', this.api.header).subscribe(data => {
                this.api.banner = data.json();
            });

        }else{
            this.api.banner = {src: '', link: ''};
        }
        //this.content.resize();
    }

    goTo() {
        window.open(this.api.banner.link, '_blank');
        return false;
    }

    openPage(page) {

        if (page._id == 'logout') {
            this.status = '';
        }


        if (page._id == 'stats') {
            this.menu3Active();
        } else {
            // close the menu when clicking a link from the menu
            this.menu.close();

            let params = '';

            // navigate to the new page if it is not the current page
            if (page.list == 'online') {
                params = JSON.stringify({
                    action: 'online',
                    filter: 'new',
                    list: '',
                    page: 1,
                    searchparams: {region: '', agefrom: 0, ageto: 0, sexpreef: '', meritalstat: '', userNick: ''}
                });
            } else if (page.list == 'distance') {
                params = JSON.stringify({
                    action: 'search',
                    filter: page.list,
                    list: '',
                    page: 1,
                    searchparams: {region: '', agefrom: 0, ageto: 0, sexpreef: '', meritalstat: '', userNick: ''}
                });
            }

            else {

                params = JSON.stringify({
                    action: '',
                    list: page.list,
                    filter: 'lastActivity',
                    page: 1,
                    searchparams: {region: '', agefrom: 0, ageto: 0, sexpreef: '', meritalstat: '', userNick: ''}
                });
            }
            if (page._id == 'edit_profile') {
                let params = {user: {step: 0, register: false}};
                this.nav.push(RegisterPage, params);
            } else {
                this.nav.push(page.component, {page: page, action: 'list', params: params});
            }
        }
    }


    homePage() {
        this.storage.get('user_id').then((val) => {
            console.log(val);
            if (val) {
                this.nav.setRoot(HomePage);
                //this.api.setLocation();
            } else {
                this.nav.setRoot(LoginPage);
            }
            this.nav.popToRoot();
        });
    }

    getBingo() {
        this.storage.get('user_id').then((val) => {
            if (val) {
                this.http.get(this.api.url + '/user/bingo', this.api.setHeaders(true)).subscribe(data => {
                    this.avatar = data.json().texts.avatar;
                    this.texts = data.json().texts;
                    // DO NOT DELETE
                    if (data.json().user) {
                        let params = JSON.stringify({
                            bingo: data.json().user
                        });
                        this.nav.push('BingoPage', {data: data.json()});
                        this.http.post(this.api.url + '/user/bingo/splashed', params, this.api.setHeaders(true)).subscribe(data => {
                        });
                    }
                });

                //call
                if(this.api.pageName != 'SubscriptionPage') {
                    this.api.http.get(this.api.url + '/user/call/get', this.api.setHeaders(true)).subscribe((res: any) => {
                        let data: any = res.json();
                        if (this.api.videoChat == null && data.calls) {
                            this.callAlert(data);
                        }
                    });
                }
            }
        });
    }

    async callAlert(data){
        console.log(data);
        if(this.api.callAlertShow == false && this.api.videoChat == null) {
            this.api.playAudio('wait');
            this.api.callAlertShow = true;
            const param = {
                id: data.calls.msgFromId,
                chatId: data.calls.msgId,
                alert: true,
                username: data.calls.nickName,
            };
            this.api.checkVideoStatus(param);
            this.api.callAlert = await this.api.alertCtrl.create({
                title: '<img class="alert-call" src="' + data.calls.img.url + '"> ' + data.calls.title,
                // header: 'שיחה נכנסת',
                message: data.calls.title.message,
                buttons: [
                    {
                        text: data.calls.buttons[1],
                        cssClass: 'redCall',
                        role: 'cancel',
                        handler: () => {
                            this.api.stopAudio();
                            this.api.callAlertShow = false;
                            this.api.http.post(this.api.url + '/user/call/' + param.id, {
                                message: 'close',
                                id: param.chatId
                            }, this.api.setHeaders(true)).subscribe((data: any) => {
                                // let res = data;

                                console.log('close');
                                if(this.api.callAlert !== null) {
                                    this.api.callAlert.dismiss();
                                    this.api.callAlert = null;
                                }

                                // console.log(res);
                                // this.status == 'close';
                                // location.reload();
                            });
                        }
                    },
                    {
                        text: data.calls.buttons[0],
                        cssClass: 'greenCall',
                        handler: () => {
                            if(this.api.callAlert !== null) {
                                this.api.callAlert.dismiss();
                                this.api.callAlert = null;
                            }
                            // this.webRTC.partnerId = param.id;
                            // this.webRTC.chatId = param.chatId;
                            // this.nav.push(VideoChatPage, param);
                            console.log('open');
                            this.api.callAlertShow = false;

                            this.api.openVideoChat(param);
                        }
                    }
                ]
            });


            await this.api.callAlert.present();
            this.api.callAlert.onWillDismiss(() => {
                this.api.callAlertShow = false;
                this.api.callAlert = null;
                this.api.stopAudio();
                console.log('dismiss');
            });
        }
    }

    dialogPage() {
        let user = {id: this.new_message.userId};
        this.closeMsg();
        this.nav.push('DialogPage', {user: user});
    }

    getMessage() {
        //let page = this.nav.getActive();
        /*
        this.http.get(this.api.url + '/user/new/messages', this.api.setHeaders(true)).subscribe(data => {

            if ((this.new_message == '' || typeof this.new_message == 'undefined') && !(this.api.pageName == 'DialogPage')) {
                this.new_message = data.json().messages[0];
                if (typeof this.new_message == 'object') {
                    this.http.get(this.api.url + '/user/messages/notify/' + this.new_message.id, this.api.setHeaders(true)).subscribe(data => {
                    });
                }
            }

            this.message = data.json();

            this.menu_items[2].count = data.json().newNotificationsNumber;
             this.menu_items[0].count = data.json().newMessagesNumber;
             this.menu_items_footer2[2].count = data.json().newNotificationsNumber;
             this.menu_items_footer1[3].count = data.json().newMessagesNumber;
        });
    */
    }

    checkStatus() {
        //let page = this.nav.getActive();

        if (!(this.api.pageName == 'ActivationPage') && !(this.api.pageName == 'ContactUsPage') && !(this.api.pageName == 'ChangePhotosPage') && !(this.api.pageName == 'RegistrationThreePage')
            && !(this.api.pageName == 'RegisterPage') && !(this.api.pageName == 'TermsPage')) {
            if (this.status == 'no_photo') {

                let toast = this.toastCtrl.create({
                    message: this.texts.photoMessage,
                    showCloseButton: true,
                    closeButtonText: 'אישור'
                });
                if (this.texts.photoMessage) {
                    toast.present();
                }
                //alert(page);
                this.nav.push('RegisterPage');
                this.nav.push(ChangePhotosPage);
            } else if (this.status == 'not_activated') {
                // this.nav.push('ActivationPage');
            }
        }
        // if (((this.api.pageName == 'ActivationPage') && this.status == 'login')) {
        //     this.nav.push(HomePage);
        // }
    }

    ngAfterViewInit() {

        this.nav.viewDidEnter.subscribe((view) => {

            this.getBanner();

            this.events.subscribe('statistics:updated', () => {
                // user and time are the same arguments passed in `events.publish(user, time)`
                this.getStatistics();
            });

            if (this.api.pageName == 'HomePage') {
                if (this.api.status != '') {
                    this.status = this.api.status;
                }
            }

            if (this.api.pageName == 'DialogPage') {
                $('.footerMenu').hide();
            } else {
                //if (this.api.footer == true) {
                $('.footerMenu').show();
                //}
            }

            let el = this;
            window.addEventListener('native.keyboardshow', function () {
                //let page = el.nav.getActive();
                //this.keyboard.disabledScroll(true);
                $('.footerMenu, .back-btn, .link-banner').hide();
                /*if (el.api.pageName != 'LoginPage' && el.api.pageName != 'DialogPage') {
                 $('.footer').hide();
                 }*/
                if (el.api.pageName == 'DialogPage') {
                    this.content.scrollTo(0, 999999, 300);
                    setTimeout(function () {
                        $('.scroll-content, .fixed-content').css({'margin-bottom': '65px'});
                        this.content.scrollTo(0, 999999, 300);
                    }, 400);
                } else {
                    setTimeout(function () {
                        $('.scroll-content, .fixed-content').css({'margin-bottom': '0px'});
                    }, 400);
                }
            });
            window.addEventListener('native.keyboardhide', function () {

                if (el.api.pageName == 'DialogPage') {
                    $('.back-btn').show();
                    $('.footerMenu').hide();
                    $('.scroll-content, .fixed-content').css({'margin-bottom': '65px'});
                    el.content.scrollTo(0, 999999, 300);
                } else {
                    if (el.is_login) {
                        $('.footerMenu').show();
                        $('.scroll-content, .fixed-content').css({'margin-bottom': '57px'});
                    } else {
                        $('.scroll-content, .fixed-content').css({'margin-bottom': '0px'});
                    }
                }
            });

            if (el.api.pageName == 'LoginPage') {
                this.interval = false;
            }
            if (el.api.pageName == 'HomePage' && this.interval == false) {
                this.interval = true;
                this.getBingo();
            }

            this.api.setHeaders(true);

            this.storage.get('status').then((val) => {
                if (this.status == '') {
                    this.status = val;
                }
                this.checkStatus();
                if (!val) {
                    this.menu_items = this.menu_items_logout;
                    this.is_login = false
                } else {
                    this.getStatistics();
                    this.is_login = true;
                    this.menu_items = this.menu_items_login;
                }
            });
            this.username = this.api.username;

            const that = this;
            setTimeout(() => {
             that.checkActivate()
            }, 1000)
        });
    }

    checkActivate() {
        if (!this.api.isActivated && this.api.password) {
            this.api.storage.get('new_user').then((username) => {

                if (!this.pageCanEnterNotActivated.includes(this.api.pageName) && username != 1) {
                    this.nav.push(ActivationPage);
                }
            });

        }
    }

}

