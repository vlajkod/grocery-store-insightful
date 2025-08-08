import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginateReqDto {
  @ApiPropertyOptional({ default: 1, example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10, example: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class PaginateResDto<T> extends PaginateReqDto {
  @ApiProperty({ example: 10 })
  total: number;
  @ApiProperty({ example: 2 })
  pageCount: number;
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  items: T[];
}
