import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, ValidateIf, IsUUID } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

/** Allows `assignedTo: null` to clear assignee (PartialType + UUID rejects null). */
export class UpdateTaskDto extends PartialType(OmitType(CreateTaskDto, ['assignedTo'] as const)) {
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined && v !== '')
  @IsUUID()
  assignedTo?: string | null;
}
