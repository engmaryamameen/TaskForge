import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
