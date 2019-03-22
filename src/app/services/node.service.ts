import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  errorMsg = 'Node error - offline';

  status:boolean = null; // null - loading, false - offline, true - online
  
  constructor(private notifications: NotificationService) {
    this.notifications.sendInfo('Connecting to the node. Please wait.', { identifier: 'node-connect', length: 0 })
   }


  setOffline(message) {
    /*if (this.status === false) {
      return; // Already offline
    }
    */
    this.status = false;
    const errMessage = message || this.errorMsg;
    this.notifications.sendError(errMessage, { identifier: 'node-offline', length: 0 });
  }

  setOnline() {
    if (this.status) {
      return; // Already online
    }

    this.status = true;
    this.notifications.removeNotification('node-offline');
    this.notifications.removeNotification('node-connect');
    this.notifications.sendSuccess('Successfully connected to the node.', { identifier: 'node-connected', length: 2000 });
  }

}
