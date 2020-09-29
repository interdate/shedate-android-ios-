import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, LoadingController, ToastController} from 'ionic-angular';
import {ApiQuery} from '../../library/api-query';
import {Http} from '@angular/http';

/**
 * Generated class for the InboxPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-inbox',
    templateUrl: 'inbox.html',
})
export class InboxPage {

    users: Array<{ id: string, message: string, mainImage: string, nickName: string, newMessagesNumber: string, faceWebPath: string, noPhoto: string }>;
    texts: { no_results: string };

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public http: Http,
                public loadingCtrl: LoadingController,
                public api: ApiQuery,
                public toastCtrl: ToastController) {

        this.api.showLoad()

        this.http.get(this.api.url + '/user/contacts/perPage:200/page:1', this.api.setHeaders(true)).subscribe(data => {
            this.users = data.json().allChats;
            this.api.hideLoad();
        }, error => {
            this.api.hideLoad();
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad InboxPage');
    }

    ionViewWillEnter() {
        this.api.pageName = 'InboxPage';
    }

    deleteDialog(event, user) {
        const cache = this.users;
        this.users = this.users.filter((elem: any) => elem.user.userId != user.user.userId);

        this.http.get(this.api.url + '/user/messenger/inbox/delete/' + user.user.userId, this.api.header).subscribe((res: any) => {
           res = res.json();

           this.toastCtrl.create({
                message: res.message,
                dismissOnPageChange: true,
                showCloseButton: true,
               closeButtonText: 'סגור',
                duration: 2500,
            }).present();

            if (!res.success) {
                this.users = cache;
            }
        }, () => {
            this.users = cache;
        });

        event.stopPropagation();
    }

    toDialogPage(user) {
        console.log(user)
        user.newMessagesCount = 0;
        this.navCtrl.push('DialogPage', {user: user.user});
    }

}
