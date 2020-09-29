import {Component} from "@angular/core";
import {Http} from "@angular/http";
import {Storage} from "@ionic/storage";
import {NavController, NavParams, LoadingController, ToastController, Events, AlertController} from "ionic-angular";
import {ApiQuery} from "../../library/api-query";
import {ProfilePage} from "../profile/profile";
import {DialogPage} from "../dialog/dialog";
import "rxjs/add/operator/map";

@Component({
    selector: 'advanced-search-result',
    templateUrl: 'advanced-search-result.html'
})
export class AdvancedSearchResultPage {

    public options: {filter: any} = {filter: 1};
    list: any;
    action: any;
    offset: any;
    sort: any = '';
    page_counter: any = 1;
    per_page: any = 10;
    user_counter: any = 10;
    loader: any = true;
    username: any;
    password: any;
    texts: any;
    filter: any;
    filters: any;
    blocked_img: any = false;
    get_params: { page: any, count: any, advanced_search: any} = {page: 1, count: 10, advanced_search: {}};
    url: any = false;
    form_filter: any;
    users: Array<{ id: string, distance: string, isFav: string, city: string, isPaying: string, isOnline: string, isAddBlackListed: string, nickName: string,
        mainImage: { url: any }, age: string, region_name: string, image: string, about: {}, component: any}>;
    params: { action: any, page: any, list: any } = {action: 'online', page: 1, list: ''};
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

        this.get_params = this.navParams.get('params');
        this.get_params = JSON.parse(String(this.get_params));

        this.page_counter = 1;

        this.storage.get('username').then((username) => {
            this.username = username;
            this.getUsers();
        });


        this.storage.get('password').then((password) => {
            this.password = password;
        });

    }

    itemTapped(user) {

        this.navCtrl.push(ProfilePage, {
            user: user
        });
    }

    toDialog(user) {
        this.navCtrl.push(DialogPage, {
            user: user
        });
    }

    back() {
        this.navCtrl.pop();
    }

    toVideoChat(user) {
        this.api.openVideoChat({id: user.id, chatId: 0, alert: false, username: user.userNick});
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

    block(user, bool) {

        let toast;
        let url;
        if (bool == true) {
            user.isBlackListed = true;

             url = this.api.url + '/user/favorites/' + user.id + '/delete';
        }

        if (bool == false) {

            user.isBlackListed = false;

             url = this.api.url + '/user/blacklist/' + user.id + '/delete';

            var message = 'The user has been removed from your black list';

        }

        // Remove user from list
        this.users.splice(this.users.indexOf(user), 1);
        this.events.publish('statistics:updated');

        this.http.post(url, {}, this.api.setHeaders(true)).subscribe(data => {
            toast = this.toastCtrl.create({
                message: message,
                duration: 2000
            });
            toast.present();
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

        let params = JSON.stringify({
            action: 'search',
            list: '',
            filter: this.filter,
            page: 1,
            advanced_search: {
                region: this.get_params.advanced_search.region,
                ageFrom: this.get_params.advanced_search.ageFrom,
                ageTo: this.get_params.advanced_search.ageTo,
                body: this.get_params.advanced_search.body,
                hairLength: this.get_params.advanced_search.hairLength,
                hairColor: this.get_params.advanced_search.hairColor,
                eyesColor: this.get_params.advanced_search.eyesColor,
                education: this.get_params.advanced_search.education,
                occupation: this.get_params.advanced_search.occupation,
                economy: this.get_params.advanced_search.economy,
                maritalStatus: this.get_params.advanced_search.maritalStatus,
                religion: this.get_params.advanced_search.religion,
                religion2: this.get_params.advanced_search.religion2,
                smoking: this.get_params.advanced_search.smoking,
                sexpreef: this.get_params.advanced_search.sexpreef,
                food: this.get_params.advanced_search.food,
                sport: this.get_params.advanced_search.sport,
                closet: this.get_params.advanced_search.closet,
                defined: this.get_params.advanced_search.defined,
                experience: this.get_params.advanced_search.experience,
                children: this.get_params.advanced_search.children,
                animals: this.get_params.advanced_search.animals,
                heightFrom: this.get_params.advanced_search.heightFrom,
                heightTo: this.get_params.advanced_search.heightTo,
                withPhoto: this.get_params.advanced_search.withPhoto,
            }
        });

        if (this.params.list) {
            params = JSON.stringify({
                action: '',
                list: this.params.list,
                filter: this.filter,
                page: 1,
                advanced_search: {
                    region: this.get_params.advanced_search.region,
                    ageFrom: this.get_params.advanced_search.ageFrom,
                    ageTo: this.get_params.advanced_search.ageTo,
                    body: this.get_params.advanced_search.body,
                    hairLength: this.get_params.advanced_search.hairLength,
                    hairColor: this.get_params.advanced_search.hairColor,
                    eyesColor: this.get_params.advanced_search.eyesColor,
                    education: this.get_params.advanced_search.education,
                    occupation: this.get_params.advanced_search.occupation,
                    economy: this.get_params.advanced_search.economy,
                    maritalStatus: this.get_params.advanced_search.maritalStatus,
                    religion: this.get_params.advanced_search.religion,
                    religion2: this.get_params.advanced_search.religion2,
                    smoking: this.get_params.advanced_search.smoking,
                    sexpreef: this.get_params.advanced_search.sexpreef,
                    food: this.get_params.advanced_search.food,
                    sport: this.get_params.advanced_search.sport,
                    closet: this.get_params.advanced_search.closet,
                    defined: this.get_params.advanced_search.defined,
                    experience: this.get_params.advanced_search.experience,
                    children: this.get_params.advanced_search.children,
                    animals: this.get_params.advanced_search.animals,
                    heightFrom: this.get_params.advanced_search.heightFrom,
                    heightTo: this.get_params.advanced_search.heightTo,
                    withPhoto: this.get_params.advanced_search.withPhoto,
                }
            });
        }

        this.navCtrl.push(AdvancedSearchResultPage, {params: params});
    }

    getUsers() {

        this.api.showLoad();

        this.url = '/user/advanced/search';

        this.http.post(this.api.url + this.url + '', this.get_params, this.api.setHeaders(true)).subscribe(data => {
            this.users = data.json().users;
            this.texts = data.json().texts;
            this.form_filter = data.json().filters;
            this.filter = data.json().form.filter;
            this.user_counter = data.json().users.length;
            if (data.json().users.length < 10) {
                this.loader = false;
            }
            this.api.hideLoad();
        }, err => {
            this.api.hideLoad();
        });
    }

    moreUsers(infiniteScroll: any) {
        //alert(this.loader);
        if (this.loader == true) {
            this.loader = false;
            this.page_counter++;
            this.get_params.page = this.page_counter;
            this.get_params.count = this.per_page;

            this.url = '/user/advanced/search';

            this.http.post(this.api.url + this.url + '', this.get_params, this.api.setHeaders(true)).subscribe(data => {
                if (data.json().users.length < 10) {
                    this.loader = false;
                } else {
                    this.loader = true;
                }
                //alert(this.loader);
                for (let person of data.json().users) {
                    this.users.push(person);
                }
            });
        }
        infiniteScroll.complete();
    }

    ionViewWillEnter() {
        this.api.pageName = 'AdvancedSearchResultPage';
    }
}
