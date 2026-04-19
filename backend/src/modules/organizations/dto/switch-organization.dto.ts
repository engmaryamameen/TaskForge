import { IsUUID } from 'class-validator';

export class SwitchOrganizationDto {
  @IsUUID()
  organizationId: string;
}
