import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
  ) {}

  async findByOrgId(organizationId: string): Promise<Subscription | null> {
    return this.repo.findOne({ where: { organizationId } });
  }

  async findByOrgIdWithPlan(
    organizationId: string,
  ): Promise<Subscription | null> {
    return this.repo.findOne({
      where: { organizationId },
      relations: ['plan'],
    });
  }

  async findByStripeCustomerId(
    stripeCustomerId: string,
  ): Promise<Subscription | null> {
    return this.repo.findOne({ where: { stripeCustomerId } });
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> {
    return this.repo.findOne({ where: { stripeSubscriptionId } });
  }

  async create(data: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.repo.create(data);
    return this.repo.save(subscription);
  }

  async update(id: string, data: Partial<Subscription>): Promise<void> {
    await this.repo.update(id, data);
  }

  async bumpEntitlementsVersion(organizationId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ entitlementsVersion: () => '"entitlements_version" + 1' })
      .where('organization_id = :organizationId', { organizationId })
      .execute();
  }
}
