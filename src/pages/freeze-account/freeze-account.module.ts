import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FreezeAccountPage } from './freeze-account';

@NgModule({
  declarations: [
    FreezeAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(FreezeAccountPage),
  ],
})
export class FreezeAccountPageModule {}
