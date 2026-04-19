import { IsOptional, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../../../shared/enums';

export class CreateInviteDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
