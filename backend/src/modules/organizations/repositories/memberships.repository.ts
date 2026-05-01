import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../entities/membership.entity';

@Injectable()
export class MembershipsRepository {
  constructor(
    @InjectRepository(Membership)
    private readonly repo: Repository<Membership>,
  ) {}

  async create(data: {
    userId: string;
    organizationId: string;
    role: string;
  }): Promise<Membership> {
    const membership = this.repo.create(data);
    return this.repo.save(membership);
  }

  async findByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<Membership | null> {
    return this.repo.findOne({ where: { userId, organizationId } });
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    return this.repo.find({
      where: { userId },
      relations: ['organization'],
    });
  }

  async findByOrgId(organizationId: string): Promise<Membership[]> {
    return this.repo
      .createQueryBuilder('membership')
      .leftJoin('membership.user', 'user')
      .addSelect([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.status',
      ])
      .where('membership.organizationId = :organizationId', {
        organizationId,
      })
      .getMany();
  }
}
