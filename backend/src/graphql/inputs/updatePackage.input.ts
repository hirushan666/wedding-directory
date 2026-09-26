import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class UpdatePackageInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  @SanitizeString({ minLength: 2, maxLength: 120 })
  name: string;

  @Field()
  @SanitizeString({ maxLength: 3000, allowMultiline: true })
  description: string;

  @Field()
  @IsNumber()
  pricing: number;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresReservation?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  visible: boolean;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 2048, optional: true })
  image?: string;
}
