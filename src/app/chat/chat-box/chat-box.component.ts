import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from 'src/app/socket.service';
import { AppService } from 'src/app/app.service';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { FirstCharComponent } from 'src/app/shared/first-char/first-char.component'
import { ChatMessage } from './chat';
import { CheckUser } from 'src/app/CheckUser';


@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
  providers: [SocketService]
})
export class ChatBoxComponent implements OnInit {

  @ViewChild('scrollMe',  {static: false}) read: ElementRef;
  public scrollMe: ElementRef;


  public authToken :any;
  public userInfo :any;
  public userList :any = [];
  public disconnectedSocket :boolean;

  public scrollToChatTop:boolean= false;

  public receiverId: any;
  public receiverName: any;
  public previousChatList: any = [];
  public messageText: any; 
  public messageList: any = []; // stores the current message list display in chat box
  public pageValue: number = 0;
  public loadingPreviousChat: boolean = false;

  constructor(
    public appService: AppService,
    public socketService: SocketService,
    private toastr: ToastrService,
    public cookie: CookieService,
    public router: Router

  ) { 

  }

  ngOnInit() {

    this.authToken = this.cookie.get('authtoken');
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    this.receiverId = this.cookie.get('receiverId');
    this.receiverName = this.cookie.get('receiverName');
    console.log(this.receiverId,this.receiverName)
    console.log(this.userInfo)
    console.log(this.authToken)

    if(this.receiverId!=null && this.receiverId!=undefined && this.receiverId!=''){
      this.userSelectedToChat(this.receiverId,this.receiverName)
    }

    //this.checkStatus();
    this.verifyUserConfirmation();
    this.getOnlineUserList();

    this.getMessageFromAUser();
  }


  // public checkStatus:any =() =>{
  //   if (this.cookie.get('authtoken') === undefined || this.cookie.get('authtoken')==='' || this.cookie.get('authtoken')===null){
  //     this.router.navigate(['/']);
  //     return false;
  //   } else {
  //     return true;
  //   }

  // }

  public verifyUserConfirmation:any= () =>{
    this.socketService.verifyUser()
    .subscribe((data)=>{
      this.disconnectedSocket = false;
      this.socketService.setUser(this.authToken);

    });
  }

  public getOnlineUserList: any =() =>{
    this.socketService.onlineUserList()
    .subscribe((userList)=>{
      this.userList =[];
      console.log(this.userList)
      for(let x in userList){
        let temp = {'userId':x, 'name':userList[x], 'unread': 0, 'chatting': false}
        this.userList.push(temp);
        

      }

      console.log(this.userList);
    });
  }


  // chat related methods 


  public getPreviousChatWithAUser :any = ()=>{
    let previousData = (this.messageList.length > 0 ? this.messageList.slice() : []);
    
    this.socketService.getChat(this.userInfo.userId, this.receiverId, this.pageValue * 10)
    .subscribe((apiResponse) => {

      console.log(apiResponse);

      if (apiResponse.status == 200) {

        this.messageList = apiResponse.data.concat(previousData);

      } else {

        this.messageList = previousData;
        this.toastr.warning('No Messages available')

       

      }

      this.loadingPreviousChat = false;

    }, (err) => {

      this.toastr.error('some error occured')


    });

  }// end get previous chat with any user


  public loadEarlierPageOfChat: any = () => {

    this.loadingPreviousChat = true;

    this.pageValue++;
    this.scrollToChatTop = true;

    this.getPreviousChatWithAUser() 

  } // end loadPreviousChat

  public userSelectedToChat: any = (id, name) => {

    console.log("setting user as active") 

    // setting that user to chatting true   
    this.userList.map((user)=>{
        if(user.userId==id){
          user.chatting=true;
        }
        else{
          user.chatting = false;
        }
    })

    this.cookie.set('receiverId', id);

    this.cookie.set('receiverName', name);


    this.receiverName = name;

    this.receiverId = id;

    this.messageList = [];

    this.pageValue = 0;

    let chatDetails = {
      userId: this.userInfo.userId,
      senderId: id
    }


    this.socketService.markChatAsSeen(chatDetails);

    this.getPreviousChatWithAUser();

  } // end userBtnClick function






  public sendMessageUsingKeypress: any = (event: any) => {

    if (event.keyCode === 13) { // 13 is keycode of enter.

      this.sendMessage();

    }

  } // end sendMessageUsingKeypress

  public sendMessage: any = () => {

    if(this.messageText){

      let chatMsgObject:ChatMessage = {
        senderName: this.userInfo.firstName + " " + this.userInfo.lastName,
        senderId: this.userInfo.userId,
        receiverName: this.cookie.get('receiverName'),
        receiverId: this.cookie.get('receiverId'),
        message: this.messageText,
        createdOn: new Date()
      } // end chatMsgObject
      console.log(chatMsgObject);
      this.socketService.SendChatMessage(chatMsgObject)
      this.pushToChatWindow(chatMsgObject)
      

    }
    else{
      this.toastr.warning('text message can not be empty')

    }

  } // end sendMessage

  public pushToChatWindow : any =(data)=>{

    this.messageText="";
    this.messageList.push(data);
    this.scrollToChatTop = false;


  }// end push to chat window

  public getMessageFromAUser :any =()=>{

      this.socketService.chatByUserId(this.userInfo.userId)
      .subscribe((data)=>{
       

        (this.receiverId==data.senderId)?this.messageList.push(data):'';

        this.toastr.success(`${data.senderName} says : ${data.message}`)

        this.scrollToChatTop=false;

      });//end subscribe

  }// end get message from a user 


  public logout: any = () => {

    this.appService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          console.log("logout called")
          this.cookie.delete('authtoken');

          this.cookie.delete('receiverId');

          this.cookie.delete('receiverName');

          this.socketService.exitSocket()

          this.router.navigate(['/']);

        } else {
          this.toastr.error(apiResponse.message)

        } // end condition

      }, (err) => {
        this.toastr.error('some error occured')


      });

  } // end logout

  public showUserName = (name:string)=>{

    this.toastr.success("You are chattig with " +name)
  }



}
