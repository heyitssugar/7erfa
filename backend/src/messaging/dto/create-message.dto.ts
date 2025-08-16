import { IsString, IsMongoId, IsOptional, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsArray()
  @IsString({ each: true })
  readBy: string[];
}
