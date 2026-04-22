import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AppGateway } from './gateway/app.gateway';
import { RealtimeService } from './services/realtime.service';
import { RealtimeListener } from './listeners/realtime.listener';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtSecret'),
      }),
    }),
    UsersModule,
    OrganizationsModule,
  ],
  providers: [AppGateway, RealtimeService, RealtimeListener],
  exports: [RealtimeService],
})
export class RealtimeModule {}
