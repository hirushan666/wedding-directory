import { InputType, Field } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class CreateReviewInput {
  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2000, allowMultiline: true, optional: true })
  comment?: string;

  @Field()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  image_urls?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mentioned_service_id?: string;

  @Field()
  @IsString()
  service_id: string;

  @Field()
  @IsString()
  visitor_id: string;
}