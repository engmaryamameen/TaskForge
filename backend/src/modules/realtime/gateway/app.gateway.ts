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
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/services/users.service';
import { MembershipsService } from '../../organizations/services/memberships.service';
import { RealtimeService } from '../services/realtime.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AppGateway.name);

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
}
