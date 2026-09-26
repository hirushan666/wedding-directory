import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class CreateVendorInput {
  @Field()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(254)
  email: string;

  @Field()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  password: string;

  @Field()
  @SanitizeString({ maxLength: 60 })
  fname: string;

  @Field()
  @SanitizeString({ maxLength: 60 })
  lname: string;

  @Field()
  @SanitizeString({ maxLength: 120 })
  busname: string;

  @Field()
  @SanitizeString({ maxLength: 20 })
  phone: string;

  @Field()
  @SanitizeString({ maxLength: 100 })
  city: string;

  @Field()
  @SanitizeString({ maxLength: 200 })
  location: string;
}
