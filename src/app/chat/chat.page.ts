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

currentUsers = [];

currentUser;

currentMessage = '';

currentRoom = '';

chatColours= ['#293462','#F24C4C','#EC9B3B','#F7D716'];


  constructor(private socket: Socket, private chatMan: ChatManagerService, private toast: ToastController) { }

  ngOnInit() {
    this.socket.connect();
    this.socket.emit('setUserAuth', {name:this.chatMan.getUserName(),room:this.chatMan.getRoomCode()});
    this.currentRoom = this.chatMan.getRoomCode();
    this.setUserActivityEvent();

    this.socket.fromEvent('message').subscribe((message: any) => {
      this.messages.push(message);
      if(this.currentUsers.indexOf(message.user) === -1){

        this.currentUsers.push(message.user);

      }
    });
  }

  getUserColourFromIndex(userName){

    const userIndex = this.currentUsers.indexOf(userName);

    if(userIndex <= this.chatColours.length){

      return this.chatColours[userIndex];

    } else{
      const randNum = Math.floor(Math.random() * this.chatColours.length);

      return this.chatColours[randNum];
    }

  }

  setUserActivityEvent() {
    this.socket.fromEvent('activity'+this.chatMan.getRoomCode()).subscribe((data: any) => {
      if (data.event === 'chatLeft') {
        this.showToast(data.user + ' Left the Chat Room');
      } else {
       this.showToast(data.user + ' Joined the Chat Room');
      }
    });
  }


  sendMessage() {
    this.socket.emit('sendMessage', {room:this.currentRoom, text: this.currentMessage });
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
