import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from '../user.schema';

export class UserUpdateDto {
  @ApiPropertyOptional({ example: 'Manager Serbia' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'manager.serbia@example.rs' })
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Pass123!' })
  @IsString()
  @IsStrongPassword()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.MANAGER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: '68933bad810af7aff96b6255' })
  @IsMongoId()
  @IsOptional()
  locationId?: string;
}
