import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams} from "ionic-angular";
import {Http} from "@angular/http";
import {ApiQuery} from "../../library/api-query";

/**
 * Generated class for the AdminMessagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var $: any;

@IonicPage()
@Component({
    selector: 'page-admin-messages',
    templateUrl: 'admin-messages.html',
})
export class AdminMessagesPage {

    messages: any;

    user: any;

    constructor(public navCtrl: NavController, public api: ApiQuery, public navParams: NavParams, public http: Http) {

        this.user = navParams.get('user');

        console.log(this.user);

        this.getPage();
        this.setMessagesAsRead()
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AdminMessagesPage');
    }

    ionViewWillEnter() {
        $('.back-btn').show();
    }

    ionViewWillLeave() {
        $('.back-btn').hide();
    }

    back() {
        this.api.back = true;
        this.navCtrl.pop();
    }

    getPage() {
        this.http.get(this.api.url + '/user/admin-messages', this.api.setHeaders(true)).subscribe(data => {
            this.messages = data.json().messages;
        }, err => {
            console.log("Oops!");
        });
    }

    setMessagesAsRead(){
        this.http.post(this.api.url + '/user/admin-messages-as-read', {}, this.api.header).subscribe(data => {});
    }

}
