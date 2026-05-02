import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequestContext } from '../../../shared/interfaces';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @CurrentUser() user: RequestContext,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findByUser(
      user.userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: RequestContext) {
    const count = await this.notificationsService.getUnreadCount(user.userId);
    return { count };
  }

  @Post(':id/read')
  async markAsRead(
    @CurrentUser() user: RequestContext,
    @Param('id') id: string,
  ) {
    await this.notificationsService.markAsRead(id, user.userId);
    return { message: 'Notification marked as read' };
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: RequestContext) {
    await this.notificationsService.markAllAsRead(user.userId);
    return { message: 'All notifications marked as read' };
  }
}
