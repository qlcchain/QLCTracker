import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';


import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class IpcService {
  
  private readonly _ipc: IpcRenderer | undefined = undefined;
  
  constructor() {
       // Only load ipc if we're running inside electron
      if (environment.desktop) {
        this._ipc = (<any>window).require('electron').ipcRenderer;
        /*this.on('test',(event, url) => { 
          console.log(event); 
          console.log(url);
        });*/
      }
  }

  public send(channel: string, data?: any): void {
    if (this._ipc !== undefined) {
      return this._ipc.send(channel, data);
    }
  }

  public on(channel: string, cb: any): void {
    if (this._ipc !== undefined) {
      this._ipc.on(channel, cb);
    }
  }


}
