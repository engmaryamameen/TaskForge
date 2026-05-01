import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedWebhook } from '../entities/processed-webhook.entity';

@Injectable()
export class WebhookRepository {
  constructor(
    @InjectRepository(ProcessedWebhook)
    private readonly repo: Repository<ProcessedWebhook>,
  ) {}

  async isProcessed(stripeEventId: string): Promise<boolean> {
    return this.repo.existsBy({ stripeEventId });
  }

  async markProcessed(
    stripeEventId: string,
    eventType: string,
  ): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .values({ stripeEventId, eventType })
      .orIgnore()
      .execute();
  }
}
