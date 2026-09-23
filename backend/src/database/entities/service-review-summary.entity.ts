import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceEntity } from './service.entity';

@Entity({ name: 'service_review_summary' })
export class ServiceReviewSummaryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ServiceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;

  @Column({ name: 'summary_text', type: 'text' })
  summaryText: string;

  @Column({ name: 'review_count', type: 'integer', default: 0 })
  reviewCount: number;

  @Column({ name: 'last_review_at', type: 'timestamp', nullable: true })
  lastReviewAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}