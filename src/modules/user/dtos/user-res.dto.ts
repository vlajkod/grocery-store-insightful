import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsMongoId, IsString } from 'class-validator';
import { UserRole } from '../user.schema';

export class UserResDto {
  @IsMongoId()
  @ApiProperty({ example: '68933bad810af7aff96b6255' })
  id: string;

  @ApiProperty({ example: 'Menager Srbija' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'menager.srbija@example.rs' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '68933bad810af7aff96b6255' })
  @IsMongoId()
  locationId: string;
}
