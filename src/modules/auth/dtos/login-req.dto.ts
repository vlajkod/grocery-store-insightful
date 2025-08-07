import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class LogInReqDto {
  @ApiProperty({ example: 'manager.serbia@example.rs' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: 'Pass123!' })
  @IsString()
  @IsStrongPassword()
  password: string;
}
