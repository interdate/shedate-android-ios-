import { Component, ViewChild, Injectable } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ToastController, LoadingController, Events } from 'ionic-angular';
import {ApiQuery} from '../../library/api-query';
import {Http} from '@angular/http';
import {ChangePhotosPage} from "../change-photos/change-photos";
import {ProfilePage} from "../profile/profile";

/**
 * Generated class for the ArenaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-arena',
  templateUrl: 'arena.html',
})
@Injectable()
export class ArenaPage {

  @ViewChild(Slides) slides: Slides;

  users: Array<{ id: string, username: string, photo: string, age: string, area: string, image: string }>;
  
  texts: { like: string, add: string, message: string, remove: string, unblock: string, no_results: string  };
  notifications: any;
  checkNotifications: any;

  constructor(public navCtrl: NavController,
              public toastCtrl: ToastController,
              public navParams: NavParams,
              public http: Http,
              public loadingCtrl: LoadingController,
              public events: Events,
              public api: ApiQuery) {

    let user_id = 0;

    let loading = this.loadingCtrl.create({
    content: 'אנא המתיני...'
    });

    loading.present();

    if (navParams.get('user')) {
        user_id = navParams.get('user');
    }

    /*let params = JSON.stringify({
        action: 'arena',
        user_id: user_id
    });*/

    this.http.get(api.url + '/users/forLikes/'+user_id+'/0', api.setHeaders(true)).subscribe(data => {
    loading.dismiss();
    this.users = data.json().users.items;
    this.texts = data.json().texts;


            // If there's message, than user can't be on this page
            if (data.json().arenaStatus) {
                let toast = this.toastCtrl.create({
                    message: data.json().arenaStatus,
                    showCloseButton: true,
                    closeButtonText: 'אישור'
                });

                toast.present();
                this.navCtrl.push(ChangePhotosPage);
            }
    });
}

    setNotifications() {
      this.events.subscribe('user:created', (notifications) => {
          console.log('Welcome', notifications, 'at');
          this.notifications = notifications;
      });
    }

    goToSlide(str) {

      let user = this.users[this.slides.getActiveIndex()];
      let index = this.slides.getActiveIndex();


      if (str == 'like') {

          let params = JSON.stringify({
              toUser: user.id,
          });

          this.http.post(this.api.url + '/user/like/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {

          });

          this.users.splice(index, 1);
          this.slides.slideTo(index,1);

      } else {


          if (this.slides.isEnd()) {
              //this.slides.slideNext();
              //var that = this;
              //setTimeout(function () {
              this.slides.slideTo(0,1);
              //this.slides.update();
              //}, 10);
          } else {
              this.slides.slideNext();
          }
      }
    }

    slideChanged(event) {
      if(this.slides.getActiveIndex() == 1){
          console.log(this.users[this.slides.getActiveIndex()]);

          console.log(this.slides.getActiveIndex());
      }
    }

    toDialog() {
      let user = this.users[this.slides.getActiveIndex()];
      this.navCtrl.push('DialogPage', {
          user: user
      });
    }

    toProfile() {
      let user = this.users[this.slides.getActiveIndex()];
      this.navCtrl.push(ProfilePage, {
          user: user
      });
    }

    toNotifications() {
      this.navCtrl.push('NotificationsPage');
    }


    ionViewDidLoad() {
      console.log('ionViewDidLoad ArenaPage');
    }

    ionViewWillEnter() {
      this.api.pageName = 'ArenaPage';
    }

    ionViewDidEnter() {
      this.slides.update();
    }

}
