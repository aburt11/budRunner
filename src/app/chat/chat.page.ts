/* eslint-disable max-len */
/* eslint-disable no-var */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { Socket } from 'ngx-socket-io';

import {ChatManagerService} from '../services/chat-manager.service';
import { ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

messages = [];

currentUsers = [];

currentUser: any;

currentMessage = '';

currentRoom = '';

isMuted = true;

constraints = { audio: true };

chunks;

mediaRecorder;

// eslint-disable-next-line @typescript-eslint/member-ordering
@ViewChild('audioChat') audioElem: ElementRef;

///audioContext;

// playbackBuffers = {};
// audioWorkletNodes = {};

chatColours= ['#293462','#F24C4C','#EC9B3B','#F7D716'];


  constructor(private socket: Socket, private chatMan: ChatManagerService, private toast: ToastController, private domSanitizer: DomSanitizer) {

 //   this.audioContext = new AudioContext();
   }

  initVoiceChat(){
    console.log('VOICE REC INIT');
navigator.mediaDevices.getUserMedia(this.constraints).then(mediaStream => {
    // eslint-disable-next-line no-var
    this.mediaRecorder = new MediaRecorder(mediaStream);
    this.mediaRecorder.onstart = function() {
        this.chunks = [];
    };
    this.mediaRecorder.ondataavailable =  function(e)  {
      console.log("DATA SENT",e, this.chunks);
        this.chunks.push(e.data);
    };
    this.mediaRecorder.onstop = this.sendBlob();

});


  }

  startRecording(){
    this.mediaRecorder.start();
  }

  stopRecording(){
    this.mediaRecorder.stop();
  }


  sendBlob(){
    console.log("CHUNKS IN SENDBLOB FN",this.chunks);
      var blob = new Blob(this.chunks, { type : 'audio/webm;codecs=opus' });

      console.log('PACKET TO SEND',this.chunks);

      this.socket.emit('radio', {room:this.currentRoom,payload: blob});
  }


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

    this.initVoiceChat();

    // When the client receives a voice message it will play the sound
this.socket.fromEvent('voice').subscribe((data: any)=> {
  const blob = new Blob([data.payload], { type : 'audio/webm;codecs=opus' });

  this.audioElem.nativeElement.src = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  this.audioElem.nativeElement.play();
});

  }

  getUserColourFromIndex(userName: any){

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
    if(this.currentMessage.length > 0){
    this.socket.emit('sendMessage', {room:this.currentRoom, text: this.currentMessage });
    this.currentMessage = '';
    }
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
