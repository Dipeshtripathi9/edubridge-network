import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  body!: string;

  @ApiPropertyOptional({ description: 'Community the issue relates to' })
  @IsOptional()
  @IsString()
  communityId?: string;
}
