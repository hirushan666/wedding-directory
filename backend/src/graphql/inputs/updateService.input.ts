import { InputType, Field } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEmail, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class UpdateServiceInput {
  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 20, optional: true })
  bus_phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid business email' })
  @MaxLength(254)
  bus_email?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 4000, allowMultiline: true, optional: true })
  description?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2048, optional: true })
  banner?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photo_showcase?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  video_showcase?: string[];

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 100, optional: true })
  pricing?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2048, optional: true })
  website?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2048, optional: true })
  instagram?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2048, optional: true })
  facebook?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2048, optional: true })
  x?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2048, optional: true })
  tiktok?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 120, optional: true })
  name?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 100, optional: true })
  city?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 200, optional: true })
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
