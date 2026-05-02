import { IsOptional, IsIn, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class ActivityFilterDto extends PaginationDto {
  @IsOptional()
  @IsIn(['project', 'task', 'member', 'organization', 'invite', 'user'])
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  triggeredBy?: string;
}
