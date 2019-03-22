import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notifications$ = new BehaviorSubject(null);
  removeNotification$ = new BehaviorSubject(null);

  constructor() { }

  // This provides an entry point for all components to send notifications.
  // It exposes an observable that the actual component uses to grab new notifications

  sendNotification(type: NotificationType, message: string, options = {}) {
    console.log(message);
    this.notifications$.next({ type, message, options });
  }

  removeNotification(identifier: string) {
    this.removeNotification$.next(identifier);
  }

  sendInfo(message: string, options = {}) {
    this.sendNotification('info', message, options);
  }
  sendSuccess(message: string, options = {}) {
    this.sendNotification('success', message, options);
  }
  sendWarning(message: string, options = {}) {
    this.sendNotification('warning', message, options);
  }
  sendError(message: string, options = {}) {
    this.sendNotification('error', message, options);
  }  
}
