import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class ListProjectsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
