import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class UpdateBudgetItemInput {
  @Field({ nullable: true })
  @SanitizeString({ maxLength: 100, optional: true })
  itemName?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 500, allowMultiline: true, optional: true })
  specialNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPaidInFull?: boolean;
}
