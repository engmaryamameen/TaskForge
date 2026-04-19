import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventType } from '../../../shared/enums';
import { DomainEvent } from '../../../shared/interfaces';

@Injectable()
export class MembershipListener {
  private readonly logger = new Logger(MembershipListener.name);

  @OnEvent(EventType.MEMBER_JOINED)
  handleMemberJoined(event: DomainEvent) {
    this.logger.log(
      `Member joined org ${event.organizationId}: ${event.payload.userId} (${event.payload.role})`,
    );
  }

  @OnEvent(EventType.MEMBER_INVITED)
  handleMemberInvited(event: DomainEvent) {
    this.logger.log(
      `Member invited to org ${event.organizationId}: ${event.payload.email}`,
    );
  }

  @OnEvent(EventType.ORGANIZATION_CREATED)
  handleOrgCreated(event: DomainEvent) {
    this.logger.log(
      `Organization created: ${event.organizationId} (${event.payload.slug})`,
    );
  }

  @OnEvent(EventType.INVITE_CREATED)
  handleInviteCreated(event: DomainEvent) {
    this.logger.log(
      `Invite created for org ${event.organizationId} (role: ${event.payload.role})`,
    );
  }
}
