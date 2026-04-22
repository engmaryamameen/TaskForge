import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column()
  name: string;

  @Column({ name: 'price_monthly', type: 'int', default: 0 })
  priceMonthly: number;

  @Column({ name: 'max_members', type: 'int' })
  maxMembers: number;

  @Column({ name: 'max_projects', type: 'int' })
  maxProjects: number;

  @Column({ type: 'jsonb', default: {} })
  features: Record<string, boolean>;
}
