import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { ApiQuery } from '../../library/api-query';

/**
 * Generated class for the NotificationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  like: string = 'like';
  tabs: string = this.like;
  bingo: string = 'bingo';
  users: Array<{ id: string, date: string, username: string, is_read: string, photo: string, text: string, region_name: string, image: string, about: {}, component: any}>;
  texts: any;

 constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiQuery,
    public http: Http,

    ) {
        this.getPage();

  }

    getPage() {
        this.http.get(this.api.url+'/user/likes/notifications',this.api.setHeaders(true)).subscribe(data => {

            this.users = data.json().likesNotifications.items;
            //console.log('USERS: ' + JSON.stringify(this.users));

            this.texts = data.json().texts;
        },err => {
            console.log("Oops!");
        });
    }

  toDialog(user) {
    let user_id = user.userId;
    let bingo = user.bingo;
    this.http.post(this.api.url+'/user/notification/'+user.id+'/read',{},this.api.setHeaders(true)).subscribe(data => {

        this.getPage();

        this.users = data.json().users;

        if( bingo == 1) {
            this.navCtrl.push('DialogPage', {
                user: {'id': user_id }
            });
        }else {
            this.navCtrl.push('ArenaPage', {
                user: user_id
            });
        }
    },err => {
        console.log("Oops!");
    });

}

ionViewDidLoad() {
  console.log('ionViewDidLoad NotificationsPage');
}

  ionViewWillEnter() {
      this.api.pageName = 'NotificationsPage';
  }

}
