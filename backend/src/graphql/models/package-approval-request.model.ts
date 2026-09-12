import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PackageModel } from './package.model';
import { VisitorModel } from './visitor.model';
import { VendorModel } from './vendor.model';
import { ApprovalRequestStatus } from '../../database/entities/package-approval-request.entity';

registerEnumType(ApprovalRequestStatus, {
  name: 'ApprovalRequestStatus',
  description: 'Status of a package approval request',
});

@ObjectType()
export class PackageApprovalRequestModel {
  @Field()
  id: string;

  @Field(() => VisitorModel, { nullable: true })
  visitor?: VisitorModel;

  @Field(() => VendorModel, { nullable: true })
  vendor?: VendorModel;

  @Field(() => PackageModel, { nullable: true })
  package?: PackageModel;

  @Field()
  bookingDate: Date;

  @Field({ nullable: true })
  userNote?: string;

  @Field(() => ApprovalRequestStatus)
  status: ApprovalRequestStatus;

  @Field({ nullable: true })
  vendorMessage?: string;

  @Field({ nullable: true })
  approvedAt?: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field(() => Boolean)
  isExpired: boolean;

  @Field(() => Number, { nullable: true })
  secondsRemaining?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
