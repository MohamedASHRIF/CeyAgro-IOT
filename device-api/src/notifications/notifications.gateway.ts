//notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification as NotificationInterface } from './interfaces/notification.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        console.log(`Removed socket ${client.id} from user ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided for join:', userId);
      client.emit('error', { message: 'Invalid userId' });
      return;
    }

    console.log(`Client ${client.id} joining room for user: ${userId}`);

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client.id);

    client.join(userId);
    client.emit('joined', { userId, socketId: client.id });

    console.log(
      `Active connections for user ${userId}:`,
      this.userSockets.get(userId).size,
    );
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, userId: string) {
    console.log(`Client ${client.id} leaving room for user: ${userId}`);
    client.leave(userId);

    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  emitNotification(notification: NotificationInterface) {
    const userId = notification.userId;
    console.log(`Emitting notification to user ${userId}:`, notification);
    console.log(
      `Active sockets for user ${userId}:`,
      this.userSockets.get(userId)?.size || 0,
    );

    this.server.to(userId).emit('notification', notification);

    if (this.userSockets.has(userId)) {
      for (const socketId of this.userSockets.get(userId)) {
        this.server.to(socketId).emit('notification', notification);
      }
    }
  }

  emitNotificationRead(notification: NotificationInterface) {
    const userId = notification.userId;
    console.log(`Emitting notificationRead to user ${userId}:`, notification);

    this.server.to(userId).emit('notificationRead', notification);

    if (this.userSockets.has(userId)) {
      for (const socketId of this.userSockets.get(userId)) {
        this.server.to(socketId).emit('notificationRead', notification);
      }
    }
  }

  emitNotificationDeleted(notificationId: string, userId?: string) {
    console.log(
      `Emitting notificationDeleted: ${notificationId} for user: ${userId}`,
    );

    if (userId) {
      this.server.to(userId).emit('notificationDeleted', notificationId);

      if (this.userSockets.has(userId)) {
        for (const socketId of this.userSockets.get(userId)) {
          this.server.to(socketId).emit('notificationDeleted', notificationId);
        }
      }
    } else {
      this.server.emit('notificationDeleted', notificationId);
    }
  }

  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  isUserConnected(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId).size > 0
    );
  }
}
