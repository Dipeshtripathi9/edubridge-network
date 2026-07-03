import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupportRequestDto {
  @ApiProperty({ enum: ['REFERRAL', 'MENTORSHIP', 'GENERAL'] })
  @IsIn(['REFERRAL', 'MENTORSHIP', 'GENERAL'])
  topic!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  message!: string;
}
