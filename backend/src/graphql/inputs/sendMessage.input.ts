import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { SanitizeString } from '../../common/decorators/sanitize-string.decorator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  chatId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  visitorSenderId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  vendorSenderId?: string;

  @Field()
  @SanitizeString({ minLength: 1, maxLength: 1500, allowMultiline: true })
  content: string;
}