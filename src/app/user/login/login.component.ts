import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from './../../app.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email : any;
  public password : any;

  constructor(
    public appService : AppService,
    public router: Router,
    private toastr: ToastrService,
    private cookie: CookieService
  ) { }

  ngOnInit() {
  }

  public goToSignUp: any =() =>{
    this.router.navigate(['/sign-up']);

  }

  public signinFunction: any =() =>{
    if(!this.email){
      this.toastr.warning('Enter email')
    } else if(!this.password){
      this.toastr.warning('Enter password')
    } else {
      let data = {
        email : this.email,
        password : this.password
      }

      this.appService.signinFunction(data)
      .subscribe((apiResponse)=>{
         console.log(apiResponse)
        if (apiResponse.status === 200){
          console.log(apiResponse)

          this.cookie.set('authtoken', apiResponse.data.authToken);
          this.cookie.set('receiverId', apiResponse.data.userDetails.userId);
          this.cookie.set('receiverName', apiResponse.data.userDetails.firstName+ ' '+apiResponse.data.userDetails.lastName);
          this.appService.setUserInfoFromLocalStorage(apiResponse.data.userDetails)
          this.router.navigate(['/chat']);

        } else {
          this.toastr.error(apiResponse.message)
         console.log(apiResponse.message)
        }
      }, (err) =>{
        this.toastr.error('some error occured')

      })  
    }
  }

}
