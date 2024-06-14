import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface MessageReturn {
  ActionType: string;
  Details: {
    EventName: string;
    Message: string;
  };
}

@Injectable({
  providedIn: 'root'
})

export class ServicecsService {

  private socket: WebSocket = new WebSocket('ws://192.168.1.72:9001');
  private socketOpenPromise: Promise<void>;
  private observable: Subject<MessageReturn> = new Subject<MessageReturn>;

  constructor() { 

    this.socketOpenPromise = new Promise<void>((resolve, reject) => {
      this.socket.onopen = () => {
        console.log('Connect');
        resolve();
      };
      this.socket.onerror = (event) => {
        reject(event);
      };
    });

    this.socket.onclose = () => {
      console.log('Disconnect');
    };

    this.socket.onmessage = (event) => {
      try {
        const jsonObject: MessageReturn = JSON.parse(event.data);
        console.log(jsonObject);
        this.observable.next(jsonObject);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };

  }

  public listen(eventName?: string): Observable<string> {
    return new Observable<string>(observer => {
      this.observable.subscribe((eventMessage: MessageReturn) => {
        switch (eventMessage.ActionType) {
          case "EventAction":
            if (eventMessage.Details.EventName === eventName) {
              observer.next(eventMessage.Details.Message);
            }
            break;

          case "RoomAction":
            if (eventMessage.Details.EventName === eventName) {
              observer.next(eventMessage.Details.Message);
            }
            break;

          case "InfoUpdate":
            if (eventMessage.Details.EventName === eventName) {
              observer.next(eventMessage.Details.Message);
            }
            break;

          default:
            observer.next(eventMessage.Details.Message);
            break;
        }
      });
    });
  }

  // ----------------------------- Events ---------------------------------------------------------------------------
  public async JoinEvent(eventName : string){
    try {
      await this.socketOpenPromise;
      const message = {
        ActionType: "EventAction",
        Details: {
          event: {
            RoomActionType: "Subscribe",
            eventName: eventName
          }
        }
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting to the WebSocket:', error);
    }
  }

  public async LeaveEvent(eventName : string){
    try {
      await this.socketOpenPromise;
      const message = {
        ActionType: "EventAction",
        Details: {
          Event: {
            EventActionType: "Unsubscribe",
            EventName: eventName
          }
        }
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting', error);
    }
  }

  public async EmitToEvent(eventName : string, content : string){
    try {
      await this.socketOpenPromise;
      const message = {
        ActionType: "EventAction",
        Details: {
          Event: {
            EventActionType: "EmitMessage",
            EventName: eventName
          },
          Message: {
            MessageActionType: "Broadcast",
            Content: content
          }
        }
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting', error);
    }
  }
  // ----------------------------- Rooms ----------------------------------------------------------------------------
  public async JoinRoom(roomName : string){
    try {
      await this.socketOpenPromise;
      const message = {
        ActionType: "RoomAction",
        Details: {
          Room: {
            RoomActionType: "Join",
            RoomName: roomName
          }
        }
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting to the WebSocket:', error);
    }
  }

  public async LeaveRoom(roomName : string){
    try {
      await this.socketOpenPromise;
      const message = {
        ActionType: "RoomAction",
        Details: {
          Room: {
            RoomActionType: "Leave",
            RoomName: roomName
          }
        }
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting', error);
    }
  }

  public async EmitToRoom(roomName : string, content : string){
    try {
      await this.socketOpenPromise;
      const message = {
        ActionType: "RoomAction",
        Details: {
          Room: {
            RoomActionType: "EmitMessage",
            RoomName: roomName
          },
          Message: {
            MessageActionType: "Broadcast",
            Content: content
          }
        }
      };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error connecting', error);
    }
  }


}
