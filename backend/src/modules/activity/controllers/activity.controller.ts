import { Controller, Get, Query } from '@nestjs/common';
import { ActivityService } from '../services/activity.service';
import { ActivityFilterDto } from '../dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrgScoped } from '../../../common/decorators/org-scoped.decorator';
import { RequestContext } from '../../../shared/interfaces';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @OrgScoped()
  @Get()
  async findAll(
    @CurrentUser() user: RequestContext,
    @Query() filters: ActivityFilterDto,
  ) {
    return this.activityService.findAll(user.organizationId!, filters);
  }
}
