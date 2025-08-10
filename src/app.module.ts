import { Module } from '@nestjs/common';
import { ConfigSetupModule } from './initializers/config-setup.module';
import { MongoSetupModule } from './initializers/mongo-setup.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [ConfigSetupModule, AuthModule, MongoSetupModule, HealthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
