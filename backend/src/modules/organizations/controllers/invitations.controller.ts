import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InvitesService } from '../services/invites.service';
import { AcceptInviteDto } from '../dto';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequestContext } from '../../../shared/interfaces';
import { UsersService } from '../../users/services/users.service';
import { AppError } from '../../../shared/errors/app-error';
import { ErrorCodes } from '../../../shared/errors/error-codes';

@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitesService: InvitesService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Get('validate')
  async validate(@Query('token') token: string) {
    if (!token) {
      throw new AppError(ErrorCodes.INVITE_NOT_FOUND, 'Token is required', 400);
    }
    return this.invitesService.validateInvite(token);
  }

  @Post('accept')
  async accept(
    @CurrentUser() user: RequestContext,
    @Body() dto: AcceptInviteDto,
  ) {
    const fullUser = await this.usersService.findById(user.userId);
    if (!fullUser) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
    }

    return this.invitesService.acceptInvite(user.userId, fullUser.email, dto);
  }
}
