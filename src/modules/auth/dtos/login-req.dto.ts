import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword } from 'class-validator';

export class LogInReqDto {
  @ApiProperty({ example: 'manager.serbia@example.rs' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Pass123!' })
  @IsStrongPassword()
  password: string;
}
