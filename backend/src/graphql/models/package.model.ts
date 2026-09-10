import { ObjectType, Field } from '@nestjs/graphql';
import { OfferingModel } from './offering.model';

@ObjectType()
export class PackageModel {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  pricing: number;

  @Field(() => [String])
  features: string[];

  @Field(() => Boolean)
  visible: boolean;

  @Field(() => Boolean)
  requiresReservation: boolean;

  @Field({ nullable: true })
  image?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
  


  @Field(() => OfferingModel)
  offering: OfferingModel;

  @Field(() => [Date], { nullable: true })
  bookedDates?: Date[];
}