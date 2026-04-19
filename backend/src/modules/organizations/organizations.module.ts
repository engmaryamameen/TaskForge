import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { OrganizationsController } from './controllers/organizations.controller';
import { InvitationsController } from './controllers/invitations.controller';
import { OrganizationsService } from './services/organizations.service';
import { MembershipsService } from './services/memberships.service';
import { InvitesService } from './services/invites.service';
import { OrganizationsRepository } from './repositories/organizations.repository';
import { MembershipsRepository } from './repositories/memberships.repository';
import { InvitesRepository } from './repositories/invites.repository';
import { MembershipListener } from './listeners/membership.listener';
import { Organization } from './entities/organization.entity';
import { Membership } from './entities/membership.entity';
import { Invite } from './entities/invite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Membership, Invite]),
    UsersModule,
  ],
  controllers: [OrganizationsController, InvitationsController],
  providers: [
    OrganizationsService,
    MembershipsService,
    InvitesService,
    OrganizationsRepository,
    MembershipsRepository,
    InvitesRepository,
    MembershipListener,
  ],
  exports: [OrganizationsService, MembershipsService],
})
export class OrganizationsModule {}
