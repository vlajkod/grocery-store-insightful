import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiProperty({ example: 'someAccessToken' })
  accessToken: string;
}
