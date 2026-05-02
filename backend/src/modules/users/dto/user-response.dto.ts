import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  status: string;
  currentOrganizationId: string | null;
  createdAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.isEmailVerified = user.emailVerifiedAt != null;
    dto.status = user.status;
    dto.currentOrganizationId = user.currentOrganizationId;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
