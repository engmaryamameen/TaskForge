import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.existsBy({ email });
  }

  async updateCurrentOrg(
    userId: string,
    organizationId: string | null,
  ): Promise<void> {
    await this.repo.update(userId, { currentOrganizationId: organizationId });
  }
}
