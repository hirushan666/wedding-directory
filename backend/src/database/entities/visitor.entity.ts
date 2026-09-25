import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ReviewEntity } from './review.entity';
import { MyVendorsEntity } from './myVendors.entity';
import { GuestListEntity } from './guestlist.entity';
import { ChecklistEntity } from './checklist.entity';
import { PaymentEntity } from './payment.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity({ name: 'visitor' })
export class VisitorEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Field()
  @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: true })
  visitor_fname?: string;

  @Field()
  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
  visitor_lname?: string;

  @Column({
    name: 'partner_first_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  partner_fname?: string;

  @Column({
    name: 'partner_last_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  partner_lname?: string;

  @Column({ name: 'engagement_date', type: 'varchar', nullable: true })
  engaged_date?: string;

  @Column({
    name: 'wedding_venue',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  wed_venue?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  profile_pic_url?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ name: 'is_onboarded', type: 'boolean', default: false, nullable: true })
  isOnboarded?: boolean;

  @OneToMany(() => ReviewEntity, (r) => r.visitor)
  reviews: ReviewEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => MyVendorsEntity, (m) => m.visitor, { cascade: true })
  myVendors: MyVendorsEntity[];

  @OneToMany(() => GuestListEntity, (o) => o.visitor, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  guestlist: GuestListEntity[];

  @OneToMany(() => ChecklistEntity, (checklist) => checklist.visitor, {
    cascade: true,
  })
  checklists: ChecklistEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.visitor)
  payments: PaymentEntity[];

  // Keep the internal property name used by checklist/date logic.
  @Column({ name: 'wedding_date', type: 'varchar', nullable: true })
  weddingDate?: string;

  get wed_date(): string | undefined {
    return this.weddingDate;
  }

  set wed_date(value: string | undefined) {
    this.weddingDate = value;
  }
}
