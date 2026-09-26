import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class CreateGuestListInput {
  @Field()
  @SanitizeString({ minLength: 1, maxLength: 80 })
  name: string;

  @Field()
  @SanitizeString({ maxLength: 20 })
  number: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 200, optional: true })
  address?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 30, optional: true })
  contact?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid guest email' })
  @MaxLength(254)
  email?: string;

  @Field()
  @SanitizeString({ maxLength: 30 })
  status: string;

  @Field()
  @IsString()
  visitor_id: string;
}
