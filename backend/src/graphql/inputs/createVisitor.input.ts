import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class CreateVisitorInput {
  @Field()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email: string;

  @Field()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  visitor_fname?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  visitor_lname?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  partner_fname?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  partner_lname?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 30, optional: true })
  engaged_date?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 30, optional: true })
  wed_date?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 200, optional: true })
  wed_venue?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 20, optional: true })
  phone?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 100, optional: true })
  city?: string;
}
