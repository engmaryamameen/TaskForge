import { Controller, Post, Get, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { OrganizationsService } from '../services/organizations.service';
import { InvitesService } from '../services/invites.service';
import { MembershipsService } from '../services/memberships.service';
import {
  CreateOrganizationDto,
  CreateInviteDto,
  SwitchOrganizationDto,
} from '../dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrgScoped } from '../../../common/decorators/org-scoped.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequestContext } from '../../../shared/interfaces';
import { Role } from '../../../shared/enums';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly invitesService: InvitesService,
    private readonly membershipsService: MembershipsService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: RequestContext,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.createOrganization(user.userId, dto);
  }

  @Get()
  async listMyOrgs(@CurrentUser() user: RequestContext) {
    return this.organizationsService.listUserOrganizations(user.userId);
  }

  @Post('switch')
  async switchOrg(
    @CurrentUser() user: RequestContext,
    @Body() dto: SwitchOrganizationDto,
  ) {
    await this.organizationsService.switchOrganization(
      user.userId,
      dto.organizationId,
    );
    return { message: 'Active organization switched' };
  }

  @OrgScoped()
  @Get('current')
  async getCurrent(@CurrentUser() user: RequestContext) {
    return this.organizationsService.findById(user.organizationId!);
  }

  @OrgScoped()
  @Get('members')
  async listMembers(@CurrentUser() user: RequestContext) {
    return this.membershipsService.listOrgMembers(user.organizationId!);
  }

  @OrgScoped()
  @Roles(Role.ADMIN, Role.MEMBER)
  @Get('invites')
  async listInvites(@CurrentUser() user: RequestContext) {
    return this.invitesService.listPendingInvites(user.organizationId!);
  }

  @OrgScoped()
  @Roles(Role.ADMIN)
  @Post('invites')
  async createInvite(
    @CurrentUser() user: RequestContext,
    @Body() dto: CreateInviteDto,
  ) {
    return this.invitesService.createInvite(user, dto);
  }

  @OrgScoped()
  @Roles(Role.ADMIN)
  @Post('invites/:inviteId/resend')
  async resendInvite(
    @CurrentUser() user: RequestContext,
    @Param('inviteId', ParseUUIDPipe) inviteId: string,
  ) {
    return this.invitesService.resendInvite(user, inviteId);
  }
}
