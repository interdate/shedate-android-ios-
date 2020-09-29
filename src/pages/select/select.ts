import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

/**
 * Generated class for the SelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-select',
    templateUrl: 'select.html',
})
export class SelectPage {

    data: any;
    options: any = [];
    page: any = 1;
    count: any = 50;
    opt_add:any = true;

    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {

        this.data = this.navParams.get('data');
        this.addOption();
        //let that = this;
        //setTimeout(function(){
        //   that.page++;
        //   that.addOption();
        //},500);
        //this.options = this.data.choices;
    }

    addOption(){
        if(this.opt_add) {
            let start = 0;
            let finish = this.data.choices.length;
            if (this.page == 1 && finish > this.count) {
                finish = this.count;
            } else {
                start = this.count * (this.page - 1);
                finish = this.count * this.page;
                if (finish > this.data.choices.length) {
                    finish = this.data.choices.length;
                }
            }
            // if(this.page == 2){
            //   start = 10;
            // }
            //alert(start + ':' + finish);
            let i: any = 0;
            for (let opt of this.data.choices) {
                //console.log(item);
                //alert(i >= start && i < finish);
                if (i >= start && i < finish) {
                    this.options.push(opt);
                }
                i++;
            }
        }
    }

    getItems(ev: any) {
        // Reset items back to all of the items
        this.options = this.data.choices;

        // set val to the value of the searchbar
        let val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.opt_add = false;
            this.options = this.options.filter((item) => {
                return (item.label.indexOf(val.toLowerCase()) > -1);
            })
        }else{
            this.opt_add = true;
            this.options = [];
            this.page = 1;
            this.addOption();
        }
    }

    close(){
        this.navCtrl.pop();
    }

    getItem(item){
        this.viewCtrl.dismiss(item);
    }

    moreItems(infiniteScroll: any) {
        //alert(this.page);
        this.page++;
        this.addOption();
        //setTimeout(() => {
        infiniteScroll.complete();
        //}, 1000);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SelectPage');
    }

}
