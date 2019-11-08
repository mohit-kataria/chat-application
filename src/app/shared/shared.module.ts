import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDetailsComponent } from './user-details/user-details.component';
import { FirstCharComponent } from './first-char/first-char.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [UserDetailsComponent, FirstCharComponent],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    FirstCharComponent,
    UserDetailsComponent,
    FormsModule
  ]
})
export class SharedModule { }
