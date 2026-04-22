import { IsIn } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsIn(['pro', 'enterprise'])
  planId: string;
}
