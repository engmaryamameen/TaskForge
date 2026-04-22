import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PlanGuard } from '../guards/plan.guard';

export const REQUIRE_PLAN_KEY = 'requirePlan';

export const RequirePlan = (...features: string[]) =>
  applyDecorators(SetMetadata(REQUIRE_PLAN_KEY, features), UseGuards(PlanGuard));
