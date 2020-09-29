import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as $ from "jquery";
import {Http} from "@angular/http";
import {ApiQuery} from "../../library/api-query";
/**
 * Generated class for the Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-page',
  templateUrl: 'page.html',
})
export class Page {

  page: any;

  constructor(
      public navCtrl: NavController,
      public navParams: NavParams,
      public api: ApiQuery,
      public http: Http
  ) {
    this.api.showLoad();
    this.http.get(this.api.url + '/user/page/' + this.navParams.get('pageId'), this.api.setHeaders(false)).subscribe(
        data => {
          //alert(JSON.stringify(data));
          console.log('page: ', data.json());
          this.page = data.json().success;
          this.api.hideLoad();
          //$('#content').html(this.page.pageText);
          //this.content.scrollToTop(300);
        }, err => {
          console.log('register: ', err);
          this.page = {
            title: 'Page Error',
            content: err._body
          };
          $('#content').html(this.page.pageText);
          this.api.hideLoad();
        }
    );
  }

  ionViewWillEnter() {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Page');
  }

}
