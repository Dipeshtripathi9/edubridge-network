import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateDirectChatDto {
  @ApiProperty({ description: 'The other user to chat with' })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;

  @ApiPropertyOptional({ type: [String], description: 'S3 keys' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class MessageQueryDto extends PaginationDto {}
