import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString } from 'class-validator';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Current status of the application',
    example: 'OK',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Timestamp of the health check',
    example: '2025-01-30T12:34:56.789Z',
  })
  @IsISO8601()
  timestamp: string;
}
