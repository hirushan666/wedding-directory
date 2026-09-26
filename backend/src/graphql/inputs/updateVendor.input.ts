import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class UpdateVendorInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  fname?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  lname?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 120, optional: true })
  busname?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 20, optional: true })
  phone?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 100, optional: true })
  city?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 200, optional: true })
  location?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 3000, allowMultiline: true, optional: true })
  about?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2048, optional: true })
  profile_pic_url?: string;
}
