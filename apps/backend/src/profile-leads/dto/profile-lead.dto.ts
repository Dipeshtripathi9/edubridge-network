import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// A student saving one step of their EduBridge Profile. The step's fields are an
// arbitrary JSON object (shape differs per step); the server just stores it.
export class UpsertProfileStepDto {
  @ApiProperty({ enum: [1, 2, 3, 4] })
  @IsIn([1, 2, 3, 4])
  step!: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  completionPct!: number;

  @ApiProperty()
  @IsObject()
  data!: Record<string, unknown>;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) email?: string;
}

export class ProfileLeadNoteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  note!: string;
}

export class DeleteProfileLeadDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  reason!: string;
}
