import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('organization_usage')
export class OrganizationUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', unique: true })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'projects_count', type: 'int', default: 0 })
  projectsCount: number;

  @Column({ name: 'members_count', type: 'int', default: 0 })
  membersCount: number;

  @Column({ name: 'tasks_count', type: 'int', default: 0 })
  tasksCount: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
