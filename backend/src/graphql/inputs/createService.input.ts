import { InputType, Field } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class CreateServiceInput {
  @Field()
  @IsString()
  vendor_id: string;

  @Field()
  @SanitizeString({ minLength: 2, maxLength: 120 })
  name: string;

  @Field()
  @SanitizeString({ maxLength: 60 })
  category: string;

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
