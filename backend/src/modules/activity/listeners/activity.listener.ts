import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent } from '../../../shared/interfaces/domain-event.interface';
import { IQueueService, QUEUE_SERVICE } from '../../../infrastructure/queue';

@Injectable()
export class ActivityListener {
  constructor(
    @Inject(QUEUE_SERVICE) private readonly queueService: IQueueService,
  ) {}

  @OnEvent('task.*')
  async handleTaskEvent(event: DomainEvent) {
    await this.queueService.addJob('activity', event, { attempts: 3 });
  }

  @OnEvent('project.*')
  async handleProjectEvent(event: DomainEvent) {
    await this.queueService.addJob('activity', event, { attempts: 3 });
  }

  @OnEvent('member.*')
  async handleMemberEvent(event: DomainEvent) {
    await this.queueService.addJob('activity', event, { attempts: 3 });
  }

  @OnEvent('organization.*')
  async handleOrgEvent(event: DomainEvent) {
    await this.queueService.addJob('activity', event, { attempts: 3 });
  }

  @OnEvent('invite.*')
  async handleInviteEvent(event: DomainEvent) {
    await this.queueService.addJob('activity', event, { attempts: 3 });
  }

  @OnEvent('user.*')
  async handleUserEvent(event: DomainEvent) {
    await this.queueService.addJob('activity', event, { attempts: 3 });
  }
}
