import { InputType, Field } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class CreateBudgetItemInput {
  @Field()
  @SanitizeString({ minLength: 1, maxLength: 100 })
  itemName: string;

  @Field()
  @SanitizeString({ maxLength: 60 })
  category: string;

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

  @Field()
  @IsString()
  budgetToolId: string;
}
