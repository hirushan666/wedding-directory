import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class CreateChecklistInput {
  @Field()
  @SanitizeString({ minLength: 1, maxLength: 150 })
  title: string;

  @Field()
  @SanitizeString({ maxLength: 40 })
  due_date: string; // ISO format string

  @Field()
  @SanitizeString({ maxLength: 60 })
  category: string;

  @Field({ nullable: true })
  @SanitizeString({ maxLength: 500, allowMultiline: true, optional: true })
  notes?: string;

  @Field()
  @IsBoolean()
  completed: boolean;

  @Field()
  @IsString()
  visitorId: string;
}
