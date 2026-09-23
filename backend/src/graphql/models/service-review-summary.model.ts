import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ServiceReviewSummaryModel {
  @Field()
  id: string;

  @Field()
  serviceId: string;

  @Field()
  summaryText: string;

  @Field(() => Int)
  reviewCount: number;

  @Field({ nullable: true })
  lastReviewAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}