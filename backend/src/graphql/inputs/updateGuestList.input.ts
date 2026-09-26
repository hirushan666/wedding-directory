import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, MaxLength } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class UpdateGuestListInput {
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
}
