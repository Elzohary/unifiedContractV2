import { Injectable } from '@angular/core';
import { Observable, Subject, fromEvent } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';
import { ActivityLog } from '../../shared/models/activity-log.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$!: WebSocketSubject<any>;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private isConnected = false;

  private activityLogSubject = new Subject<ActivityLog>();
  activityLog$ = this.activityLogSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    if (this.isConnected) {
      return;
    }

    this.socket$ = webSocket({
      url: environment.websocketUrl,
      openObserver: {
        next: () => {
          console.log('WebSocket connection established');
          this.isConnected = true;
          this.reconnectAttempts = 0;
        }
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket connection closed');
          this.isConnected = false;
          this.handleReconnect();
        }
      }
    });

    this.socket$.subscribe({
      next: (message) => this.handleMessage(message),
      error: (error) => {
        console.error('WebSocket error:', error);
        this.handleReconnect();
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'activity_log':
        this.activityLogSubject.next(message.data as ActivityLog);
        break;
      // Add more message type handlers as needed
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  send(message: any): void {
    if (this.isConnected) {
      this.socket$.next(message);
    } else {
      console.error('Cannot send message: WebSocket is not connected');
    }
  }

  subscribeToActivityLogs(): Observable<ActivityLog> {
    return this.activityLog$;
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.isConnected = false;
    }
  }
} 