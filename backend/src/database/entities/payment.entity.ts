import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { VisitorEntity } from './visitor.entity';
import { VendorEntity } from './vendor.entity';
import { PackageEntity } from './package.entity';

@Entity()
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VisitorEntity, visitor => visitor.payments)
  visitor: VisitorEntity;

  @ManyToOne(() => VendorEntity, vendor => vendor.payments)
  vendor: VendorEntity;

  @ManyToOne(() => PackageEntity, pkg => pkg.payments)
  package: PackageEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  stripeSessionId?: string;

  @Column({ nullable: true })
  paymentReference?: string;

  @Column({ default: 'payhere' })
  gateway: string;

  @Column({ nullable: true })
  gatewayPaymentId?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  })
  status: 'pending' | 'completed' | 'failed';

  @Column({ type: 'timestamp', nullable: true })
  bookingDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
