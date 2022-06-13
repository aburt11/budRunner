import { Component, OnInit } from '@angular/core';

import { Socket } from 'ngx-socket-io';

import {ChatManagerService} from '../services/chat-manager.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

messages = [];

currentUser;

currentMessage = '';


  constructor(private socket: Socket, private chatMan: ChatManagerService, private toast: ToastController) { }

  ngOnInit() {
    this.socket.connect();
    this.socket.emit('setUserName', this.chatMan.getUserName());
    this.socket.emit('setRoomCode', this.chatMan.getRoomCode());
    this.setUserActivityEvent();

    this.socket.fromEvent('message').subscribe(message => {
      this.messages.push(message);
    });
  }

  setUserActivityEvent() {
    this.socket.fromEvent('room_'+this.chatMan.getRoomCode()).subscribe((data: any) => {
      if (data.event === 'chatLeft') {
        this.showToast(data.user + ' Left the Chat Room');
      } else {
       this.showToast(data.user + ' Joined the Chat Room');
      }
    });
  }
  sendMessage() {
    this.socket.emit('room_msg_'+this.chatMan.getRoomCode(), { text: this.currentMessage });
    this.currentMessage = '';
  }

  ionViewWillLeave() {
    this.socket.disconnect();
  }

  async showToast(msg: string){
    const toast = await  this.toast.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  clearChat(){}

}
