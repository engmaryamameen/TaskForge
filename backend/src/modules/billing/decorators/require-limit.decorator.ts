import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { LimitGuard } from '../guards/limit.guard';

export const REQUIRE_LIMIT_KEY = 'requireLimit';

export const RequireLimit = (metric: string) =>
  applyDecorators(SetMetadata(REQUIRE_LIMIT_KEY, metric), UseGuards(LimitGuard));
