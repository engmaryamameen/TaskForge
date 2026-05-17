import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { MembershipsService } from '../../organizations/services/memberships.service';
import { RealtimeService } from '../services/realtime.service';
import { EventType } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';

/** Re-validate connected sockets every 5 minutes */
const REVALIDATION_INTERVAL_MS = 5 * 60 * 1000;

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AppGateway.name);
  private revalidationTimer: ReturnType<typeof setInterval> | null = null;

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly membershipsService: MembershipsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  afterInit(server: Server): void {
    this.realtimeService.setServer(server);

    // Periodic re-validation: disconnect sockets with expired tokens or suspended users
    this.revalidationTimer = setInterval(
      () => this.revalidateConnections(),
      REVALIDATION_INTERVAL_MS,
    );

    this.logger.log('WebSocket gateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      client.emit('auth_error', { message: 'No token provided' });
      client.disconnect();
      return;
    }

    try {
      const secret = this.configService.get<string>(
        'auth.jwtSecret',
        'changeme',
      );
      const decoded = this.jwtService.verify(token, { secret });

      const user = await this.usersService.findById(decoded.sub);
      if (!user || user.status !== 'active') {
        client.emit('auth_error', { message: 'User not found or suspended' });
        client.disconnect();
        return;
      }

      client.data.userId = user.id;
      client.data.token = token;
      client.join(`user:${user.id}`);

      this.logger.log(`Client connected: ${user.id} (${client.id})`);
    } catch {
      client.emit('auth_error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.userId;
    if (userId) {
      this.logger.log(`Client disconnected: ${userId} (${client.id})`);
    }
  }

  @SubscribeMessage('join-org')
  async handleJoinOrg(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orgId: string },
  ) {
    const userId = client.data?.userId;
    if (!userId || !data?.orgId) {
      return { status: 'error', message: 'Missing userId or orgId' };
    }

    const membership = await this.membershipsService.getMembership(
      userId,
      data.orgId,
    );

    if (!membership) {
      return { status: 'error', message: 'Not a member of this organization' };
    }

    client.join(`org:${data.orgId}`);
    this.logger.log(`User ${userId} joined org:${data.orgId}`);
    return { status: 'ok', orgId: data.orgId };
  }

  @SubscribeMessage('leave-org')
  handleLeaveOrg(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orgId: string },
  ) {
    if (data?.orgId) {
      client.leave(`org:${data.orgId}`);
      this.logger.log(
        `User ${client.data?.userId} left org:${data.orgId}`,
      );
    }
    return { status: 'ok' };
  }

  // ─── REACTIVE SESSION INVALIDATION ───────────────────────────

  /**
   * When a member is removed from an org, immediately eject their
   * sockets from that org's room. No stale broadcasts.
   */
  @OnEvent('member.removed')
  handleMemberRemoved(event: DomainEvent): void {
    const userId = event.payload?.userId;
    const orgId = event.organizationId;
    if (!userId || !orgId || !this.server) return;

    const room = `user:${userId}`;
    const sockets = this.server.in(room).fetchSockets();
    void sockets.then((clients) => {
      for (const client of clients) {
        client.leave(`org:${orgId}`);
        client.emit('org_removed', { orgId });
        this.logger.log(
          `Ejected user ${userId} from org:${orgId} room (membership revoked)`,
        );
      }
    });
  }

  // ─── PERIODIC RE-VALIDATION ──────────────────────────────────

  /**
   * Walks all connected sockets and disconnects those whose JWT
   * has expired or whose user account is no longer active.
   */
  private async revalidateConnections(): Promise<void> {
    if (!this.server) return;

    const sockets = await this.server.fetchSockets();
    const secret = this.configService.get<string>('auth.jwtSecret', 'changeme');
    let disconnected = 0;

    for (const socket of sockets) {
      const token = socket.data?.token;
      const userId = socket.data?.userId;
      if (!token || !userId) continue;

      try {
        // Re-verify JWT — catches expiration
        this.jwtService.verify(token, { secret });

        // Re-check user status — catches suspension
        const user = await this.usersService.findById(userId);
        if (!user || user.status !== 'active') {
          socket.emit('auth_error', { message: 'Session invalidated' });
          socket.disconnect();
          disconnected++;
        }
      } catch {
        // Token expired or invalid
        socket.emit('auth_error', { message: 'Token expired' });
        socket.disconnect();
        disconnected++;
      }
    }

    if (disconnected > 0) {
      this.logger.log(`Revalidation: disconnected ${disconnected} stale socket(s)`);
    }
  }
}
