import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VisitorEntity } from './visitor.entity';
import { VendorEntity } from './vendor.entity';
import { PackageEntity } from './package.entity';

export enum ApprovalRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  PURCHASED = 'purchased',
}

@Entity({ name: 'package_approval_request' })
export class PackageApprovalRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VisitorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitor_id' })
  visitor: VisitorEntity;

  @ManyToOne(() => VendorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: VendorEntity;

  @ManyToOne(() => PackageEntity, (pkg) => pkg.approvalRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: PackageEntity;

  @Column({ name: 'booking_date', type: 'timestamp' })
  bookingDate: Date;

  @Column({ name: 'user_note', type: 'text', nullable: true })
  userNote?: string;

  @Column({
    type: 'enum',
    enum: ApprovalRequestStatus,
    default: ApprovalRequestStatus.PENDING,
  })
  status: ApprovalRequestStatus;

  @Column({ name: 'vendor_message', type: 'text', nullable: true })
  vendorMessage?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
