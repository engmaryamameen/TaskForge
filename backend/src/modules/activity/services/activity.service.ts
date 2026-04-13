import { Injectable } from '@nestjs/common';
import { DomainEvent } from '../../../shared/interfaces';

@Injectable()
export class ActivityService {
  async log(event: DomainEvent): Promise<void> {
    // Will be implemented with repository once entities are set up
  }
}
