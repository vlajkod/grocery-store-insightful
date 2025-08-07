import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class IdParamDto {
  @IsMongoId()
  @ApiProperty({ example: '68947a5755fb22b6e5f570c8' })
  id: string;
}
