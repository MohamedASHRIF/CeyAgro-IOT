// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { Notification as NotificationInterface } from './interfaces/notification.interface';

// @WebSocketGateway({
//   cors: {
//     origin: () => process.env.FRONTEND_URL || 'http://localhost:3000',
//   },
// })
// export class NotificationsGateway {
//   @WebSocketServer()
//   server: Server;

//   @SubscribeMessage('join')
//   //Clients connect and tell the server which user they are
//   handleJoin(client: Socket, userId: string) {
//     console.log('Client joined room:', userId);
//     client.join(userId);
//   }

//   emitNotification(notification: NotificationInterface) {
//     console.log('Emitting notification to user:', notification.userId);
//     this.server.to(notification.userId).emit('notification', notification);
//   }

//   emitNotificationDeleted(id: string) {
//     console.log('Emitting notificationDeleted:', id);
//     this.server.emit('notificationDeleted', id);
//   }
// }



// // import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
// // import { Server, Socket } from 'socket.io';
// // import { UsersService } from '../users/users.service';
// // import { Logger } from '@nestjs/common';

// // @WebSocketGateway({
// //   cors: {
// //     origin: "http://localhost:3000",
// //     methods: ["GET", "POST"],
// //     credentials: true,
// //   },
// // })
// // export class NotificationsGateway {
// //   @WebSocketServer()
// //   server: Server;

// //   private readonly logger = new Logger(NotificationsGateway.name);

// //   constructor(private readonly usersService: UsersService) {}

// //   @SubscribeMessage('join')
// //   handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
// //     this.logger.log(`Client ${client.id} joined room: ${userId}`);
// //     client.join(userId);
// //   }

// //   @SubscribeMessage('updateFcmToken')
// //   async handleUpdateFcmToken(
// //     @MessageBody() data: { userId: string; fcmToken: string },
// //     @ConnectedSocket() client: Socket,
// //   ) {
// //     try {
// //       this.logger.log(`Received updateFcmToken from ${client.id}: userId=${data.userId}, token=${data.fcmToken}`);
// //       await this.usersService.updateFcmToken(data.userId, data.fcmToken);
// //       client.emit('fcmTokenResponse', { success: true });
// //       this.logger.log(`FCM token updated for user ${data.userId}`);
// //     } catch (error) {
// //       this.logger.error(`Error updating FCM token for user ${data.userId}:`, error);
// //       client.emit('fcmTokenResponse', { success: false, error: error.message });
// //     }
// //   }

// //   notifyUser(userId: string, notification: any) {
// //     this.logger.log(`Sending notification to user ${userId}: ${JSON.stringify(notification)}`);
// //     this.server.to(userId).emit('notification', notification);
// //   }

// //   notifyDelete(userId: string, notificationId: string) {
// //     this.logger.log(`Sending notificationDeleted to user ${userId}: ${notificationId}`);
// //     this.server.to(userId).emit('notificationDeleted', notificationId);
// //   }
// // }








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
  namespace: '/notifications', // Add namespace for better organization
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove socket from all user mappings
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
    
    // Add to user-socket mapping
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client.id);
    
    // Join room
    client.join(userId);
    client.emit('joined', { userId, socketId: client.id });
    
    console.log(`Active connections for user ${userId}:`, this.userSockets.get(userId).size);
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
    console.log(`Active sockets for user ${userId}:`, this.userSockets.get(userId)?.size || 0);
    
    // Emit to specific user room
    this.server.to(userId).emit('notification', notification);
    
    // Also emit to all connected sockets for this user (redundant but ensures delivery)
    if (this.userSockets.has(userId)) {
      for (const socketId of this.userSockets.get(userId)) {
        this.server.to(socketId).emit('notification', notification);
      }
    }
  }

  emitNotificationDeleted(notificationId: string, userId?: string) {
    console.log(`Emitting notificationDeleted: ${notificationId} for user: ${userId}`);
    
    if (userId) {
      // Emit to specific user
      this.server.to(userId).emit('notificationDeleted', notificationId);
      
      if (this.userSockets.has(userId)) {
        for (const socketId of this.userSockets.get(userId)) {
          this.server.to(socketId).emit('notificationDeleted', notificationId);
        }
      }
    } else {
      // Emit to all connected clients (fallback)
      this.server.emit('notificationDeleted', notificationId);
    }
  }

  // Method to get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Method to check if user is connected
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }
}