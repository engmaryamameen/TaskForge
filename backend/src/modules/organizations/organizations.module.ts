import { Module } from '@nestjs/common';
import { OrganizationsController } from './controllers/organizations.controller';
import { OrganizationsService } from './services/organizations.service';
import { MembershipsService } from './services/memberships.service';
import { OrganizationsRepository } from './repositories/organizations.repository';
import { MembershipsRepository } from './repositories/memberships.repository';
import { MembershipListener } from './listeners/membership.listener';

@Module({
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    MembershipsService,
    OrganizationsRepository,
    MembershipsRepository,
    MembershipListener,
  ],
  exports: [OrganizationsService, MembershipsService],
})
export class OrganizationsModule {}
