import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatManagerService } from '../services/chat-manager.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {


  nickName;

  roomCode;

  constructor(private chatMan: ChatManagerService, private route: Router) { }

  ngOnInit() {
  }


  enterChatRoom(){

    this.chatMan.setUserName(this.nickName);
    this.chatMan.setRoomCode(this.roomCode);

    this.route.navigateByUrl('/chat');

  }

}
