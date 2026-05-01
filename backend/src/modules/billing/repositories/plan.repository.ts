import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';

@Injectable()
export class PlanRepository {
  constructor(
    @InjectRepository(Plan)
    private readonly repo: Repository<Plan>,
  ) {}

  async findById(id: string): Promise<Plan | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<Plan[]> {
    return this.repo.find({ order: { priceMonthly: 'ASC' } });
  }
}
