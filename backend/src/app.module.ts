import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { databaseConfig, redisConfig, authConfig } from './config';
import { DatabaseModule } from './infrastructure/database/database.module';

// Guards (registered in order: JWT → OrgMembership → Roles)
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from './common/guards/org-membership.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Business modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ActivityModule } from './modules/activity/activity.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, authConfig],
    }),

    // Database
    DatabaseModule,

    // Event bus for module communication
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),

    // Business modules
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    TasksModule,
    ActivityModule,
    RealtimeModule,
  ],
  providers: [
    // Global guards — execution order follows registration order
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: OrgMembershipGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
