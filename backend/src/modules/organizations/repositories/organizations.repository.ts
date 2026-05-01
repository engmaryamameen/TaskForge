import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationsRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
  ) {}

  async create(data: {
    name: string;
    slug: string;
    createdBy: string;
  }): Promise<Organization> {
    const org = this.repo.create(data);
    return this.repo.save(org);
  }

  async findById(id: string): Promise<Organization | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async slugExists(slug: string): Promise<boolean> {
    return this.repo.existsBy({ slug });
  }
}
