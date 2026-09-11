import { ObjectType, Field, Float } from '@nestjs/graphql';
import { VisitorModel } from './visitor.model';
import { VendorModel } from './vendor.model';
import { PackageModel } from './package.model';

@ObjectType()
export class PaymentModel {
  @Field()
  id: string;

  @Field(() => VisitorModel)
  visitor: VisitorModel;

  @Field(() => VendorModel)
  vendor: VendorModel;

  @Field(() => PackageModel)
  package: PackageModel;

  @Field(() => Float)
  amount: number;

  @Field({ nullable: true })
  stripeSessionId?: string;

  @Field({ nullable: true })
  paymentReference?: string;

  @Field({ nullable: true })
  gateway?: string;

  @Field({ nullable: true })
  gatewayPaymentId?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  bookingDate: Date;

  @Field()
  createdAt: Date;
}
