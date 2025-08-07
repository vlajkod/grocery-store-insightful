import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthLoginService } from './auth-login.service';
import { AuthController } from './auth.controller';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthorizationGuard } from './guards/authorization.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.secret'),
        signOptions: { expiresIn: configService.get('auth.expiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthLoginService,
    { provide: 'APP_GUARD', useClass: AuthenticationGuard },
    { provide: 'APP_GUARD', useClass: AuthorizationGuard },
  ],
})
export class AuthModule {}
