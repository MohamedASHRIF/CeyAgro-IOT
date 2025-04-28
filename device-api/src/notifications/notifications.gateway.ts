import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification as NotificationInterface } from './interfaces/notification.interface';

@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    console.log('Client joined room:', userId);
    client.join(userId);
  }

  emitNotification(notification: NotificationInterface) {
    console.log('Emitting notification to user:', notification.userId);
    this.server.to(notification.userId).emit('notification', notification);
  }

  emitNotificationDeleted(id: string) {
    console.log('Emitting notificationDeleted:', id);
    this.server.emit('notificationDeleted', id);
  }
}
