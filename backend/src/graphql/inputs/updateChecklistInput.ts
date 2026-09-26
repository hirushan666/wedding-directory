import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class UpdateChecklistInput {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 150, optional: true })
  title?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 40, optional: true })
  due_date?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 60, optional: true })
  category?: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 500, allowMultiline: true, optional: true })
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
