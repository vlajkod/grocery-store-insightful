import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class LocationIdDto {
  @ApiProperty({ example: '68933bad810af7aff96b6255' })
  @IsMongoId({})
  locationId: string;
}
