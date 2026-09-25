import { ObjectType, Field } from '@nestjs/graphql';
import { VendorModel } from './vendor.model';
import { ReviewModel } from './review.model';  // Add this import
import { ServiceMediaModel } from './service-media.model';

@ObjectType()
export class ServiceModel {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  category: string;

  @Field({ defaultValue: false })
  visible: boolean;

  @Field({ nullable: true })
  bus_phone: string;

  @Field({ nullable: true })
  bus_email: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  banner: string;

  @Field(() => [String], { nullable: true })
  photo_showcase: string[];

  @Field(() => [String], { nullable: true })
  video_showcase: string[];

  @Field(() => [ServiceMediaModel], { nullable: true })
  media?: ServiceMediaModel[];

  @Field({ nullable: true })
  experience: string;

  @Field({ nullable: true })
  pricing: string;

  @Field({ nullable: true })
  website : string;

  @Field({ nullable: true })
  instagram: string;

  @Field({ nullable: true })
  facebook: string;

  @Field({ nullable: true })
  x: string;

  @Field({ nullable: true })
  tiktok: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  latitude?: number;

  @Field({ nullable: true })
  longitude?: number;
  
  @Field({ nullable: true })
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt: Date;

  @Field(() => [ReviewModel], { nullable: true })
  reviews: ReviewModel[];

  @Field(() => VendorModel)
  vendor: VendorModel;
}
