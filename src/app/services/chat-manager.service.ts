import { Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class ChatManagerService {

  userName;

  roomCode;

  constructor() { }

  setUserName(name: string){
    this.userName = name;
  }

  getUserName(){
    return this.userName;
  }

  getRoomCode(){
    return this.roomCode;
  }

  setRoomCode(code: string){
    this.roomCode = code;

  }



}
