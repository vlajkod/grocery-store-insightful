import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { AuthLoginService } from './auth-login.service';
import { LogInReqDto } from './dtos/login-req.dto';
import { LoginResDto } from './dtos/login-res.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authLoginService: AuthLoginService) {}

  @ApiOperation({ summary: 'Logs in a user.' })
  @ApiResponse({ status: HttpStatus.OK, type: LoginResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() logInDto: LogInReqDto): Promise<LoginResDto> {
    return this.authLoginService.execute(logInDto.email, logInDto.password);
  }
}
