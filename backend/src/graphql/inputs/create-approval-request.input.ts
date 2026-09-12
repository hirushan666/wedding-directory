import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateApprovalRequestInput {
  @Field()
  packageId: string;

  @Field()
  visitorId: string;

  @Field()
  bookingDate: Date;

  @Field({ nullable: true })
  userNote?: string;
}
