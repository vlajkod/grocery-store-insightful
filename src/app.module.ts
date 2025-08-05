import { Module } from '@nestjs/common';
import { ConfigSetupModule } from './initializers/config-setup.module';
import { MongoSetupModule } from './initializers/mongo-setup.module';
import { HealthModule } from './modules/health/health.module';
import { LocationModule } from './modules/location/location.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigSetupModule,
    MongoSetupModule,
    HealthModule,
    UserModule,
    LocationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
