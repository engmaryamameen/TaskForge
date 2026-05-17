import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';
import { ProjectMemberRole } from '../../../shared/rbac';

@Entity('project_members')
@Unique(['projectId', 'userId'])
@Index(['projectId'])
@Index(['userId'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ProjectMemberRole,
    default: ProjectMemberRole.MEMBER,
  })
  role: ProjectMemberRole;

  @Column({ name: 'added_by' })
  addedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by' })
  addedByUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
