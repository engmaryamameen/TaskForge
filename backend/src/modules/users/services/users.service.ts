import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(data: CreateUserDto): Promise<User> {
    return this.usersRepository.create(data);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.usersRepository.existsByEmail(email);
  }

  async updateCurrentOrg(
    userId: string,
    organizationId: string | null,
  ): Promise<void> {
    return this.usersRepository.updateCurrentOrg(userId, organizationId);
  }

  async setEmailVerifiedAt(userId: string, at: Date): Promise<void> {
    return this.usersRepository.setEmailVerifiedAt(userId, at);
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    return this.usersRepository.updatePasswordHash(userId, passwordHash);
  }

  async updateProfile(
    userId: string,
    patch: { firstName?: string; lastName?: string },
  ): Promise<void> {
    return this.usersRepository.updateProfile(userId, patch);
  }
}
