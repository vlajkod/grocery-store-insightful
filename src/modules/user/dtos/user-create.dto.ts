import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from '../user.schema';

export class UserCreateDto {
  @ApiProperty({ example: 'Manager Serbia' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'manager.srbija@example.rs' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Pass123!' })
  @IsStrongPassword()
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '68933bad810af7aff96b6255' })
  @IsMongoId()
  locationId: string;
}
