import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { RealtimeEvent } from '../types/realtime-event.interface';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server | null = null;

  setServer(server: Server): void {
    this.server = server;
    this.logger.log('WebSocket server initialized');
  }

  broadcastToOrg(
    orgId: string,
    eventName: string,
    payload: RealtimeEvent,
  ): void {
    if (!this.server) return;

    this.server.to(`org:${orgId}`).emit(eventName, payload);
    this.logger.debug(
      `Broadcast [${eventName}] to org:${orgId} (entity: ${payload.entityId})`,
    );
  }

  broadcastToUser(
    userId: string,
    eventName: string,
    payload: RealtimeEvent,
  ): void {
    if (!this.server) return;

    this.server.to(`user:${userId}`).emit(eventName, payload);
    this.logger.debug(`Broadcast [${eventName}] to user:${userId}`);
  }
}
