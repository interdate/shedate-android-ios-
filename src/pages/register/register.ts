import {Component, ViewChild} from "@angular/core";
import {ActionSheetController, Content, ModalController, NavController, NavParams, Platform} from "ionic-angular";
import {ApiQuery} from "../../library/api-query";
import * as $ from "jquery";
import {Http} from "@angular/http";

import {HomePage} from "../home/home";
import {Page} from "../page/page";
import {ChangePhotosPage} from "../change-photos/change-photos";
import {SelectPage} from "../select/select";
declare var setSelect2;

@Component({
    selector: 'page-register',
    templateUrl: 'register.html',
})
export class RegisterPage {
    @ViewChild(Content) content: Content;
    login: any = false;
    user: any = {};
    form: any = {fields: []};
    errors: any;
    activePhoto: any;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public api: ApiQuery,
                public http: Http,
                public platform: Platform,
                public actionSheetCtrl: ActionSheetController) {
        api.storage.get('status').then((val) => {
            this.login = val;
            this.user = this.navParams.get('user');
            this.sendForm();
        });
    }

    getStep(step): void {
        if(this.login == 'login') {
            this.user.step = step;
            this.sendForm();
        }
    }

    openSelect(field, index) {
        if(typeof field == 'undefined'){
            field = false;
        }

        let profileModal = this.api.modalCtrl.create(SelectPage, {data: field});

        profileModal.present();

        profileModal.onDidDismiss(data => {

            if (data) {
                let choosedVal = data.val.toString();
                this.user[field.name] = choosedVal;
                if(field.name.indexOf('userBirthday') == -1) {
                    this.form.fields[index]['valLabel'] = data.label.toString();
                    if(this.form.fields[index]['name'] == 'userCity'){
                        this.form.fields[index]['valLabel'] = data.label.toString();
                        this.form.fields[index]['val'] = data.label.toString();
                        this.user.userCity = data.label.toString();

                    }else{
                        this.form.fields[index]['valLabel'] = data.label.toString();
                        this.form.fields[index]['val'] = choosedVal;
                    }
                }else{
                    for(let i=0; i<3; i++){
                        if(field.name == this.form.fields[index]['sel'][i].name){
                            this.form.fields[index]['sel'][i]['valLabel'] = data.label;
                        }
                    }
                }
            }
                //this.form.fields[6].label = '*מספר טלפון';
        });
    }

    sendForm() {
        this.api.showLoad();
        let header = this.api.setHeaders((this.login == 'login') );
        this.form.fields.forEach(field => {

            if (field.type == 'selects') {
                field.sel.forEach(select => {
                    // this.user[select.name] = $('#' + select.name).val();
                    console.log(select);
                    console.log(this.user[field.name]);
                });
            }
        });

        this.http.post(this.api.url + '/user/register', this.user, header).subscribe(
            data => {
                $('#labelconfirmMails').remove();
                this.form = data.json().form;
                this.user = data.json().user;
                this.errors = data.json().errors;

                if (this.user.step == 4) {
                    this.api.setHeaders(true, this.user.userNick, this.user.userPass);
                    this.login = 'login';
                    this.api.storage.set('status', 'login');
                    this.api.storage.set('user_id', this.user.userId);
                    this.api.storage.set('username', this.user.userNick);
                    this.api.storage.set('fingerAuthLogin', this.user.userNick);
                    this.api.storage.set('password', this.user.userPass);
                    let that = this;
                    setTimeout(function () {
                        that.api.hideLoad();
                    }, 1000);
                    this.api.storage.get('deviceToken').then((val) => {
                        this.api.sendPhoneId(val);
                    });
                    this.navCtrl.push(ChangePhotosPage, {new_user: this.form.submit});

                } else {
                    this.api.hideLoad();

                    if (this.user.step == 2 && !this.user.register) {
                        this.api.storage.set('username', this.user.userNick);
                        this.api.storage.set('fingerAuthLogin', this.user.userNick);
                        this.api.setHeaders(true, this.user.userNick);
                    }else if(this.user.step == 2 && this.user.register) {
                        this.api.storage.set('new_user', true);
                    }
                    this.form.fields.forEach(field => {
                        if (field.type == 'select' /*&& field.name != 'userCity' && field.name != 'countryOfOriginId'*/) {
                            this.select2(field, null);
                        }
                        if (field.type == 'selects') {
                            field.sel.forEach(select => {
                                this.select2(select, select.choices[0].label);
                            });
                        }
                    });

                    this.content.scrollToTop(300);
                }
            }, err => {
                this.errors = err._body;
                this.api.hideLoad();
            }
        );
    }

    select2(field, placeholder) {
        setSelect2('#' + field.name,
            {
                placeholder: (typeof placeholder == 'undefined') ? "בחר מהרשימה" : placeholder
            }
        );
    }

    stepBack() {
        this.user.step = this.user.step - 2;
        this.sendForm();
    }

    setHtml(id, html) {
        if ($('#' + id).html() == '' && html != '') {
            let div: any = document.createElement('div');
            div.innerHTML = html;
            [].forEach.call(div.getElementsByTagName("a"), (a) => {
                var pageHref = a.getAttribute('onclick');
                if (pageHref) {
                    a.removeAttribute('onclick');
                    a.onclick = () => this.getPage(pageHref);
                }
            });
            $('#' + id).append(div);
        }
    }

    getPage(pageId) {
        this.navCtrl.push(Page, {pageId: pageId});
    }

    ionViewWillEnter() {
        this.api.pageName = 'RegisterPage';

        $('#back').show();
        this.api.storage.get('status').then((val) => {
            this.login = val;
            if(val != 'login') {
                $('.footerMenu').hide();
            }
        });

        setTimeout(function () {
            if($('div').hasClass('footerMenu')) {
            }else{
                $('#register .fixed-content,#register .scroll-content').css({'margin-bottom': '0'});
            }
        },100);

    }

    ionViewWillLeave() {
        $('#contact').removeAttr('style');
        if (this.login == 'login') {
            $('.mo-logo').click();
        }

    }

    inputClick(id) {
        let that = this;
        that.content.resize();
    }

    goToHome() {
        this.navCtrl.setRoot(HomePage);
        this.navCtrl.popToRoot();
    }


}
