import { Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import appConfig from 'src/config/app.config';
import authConfig from 'src/config/auth.config';
import dbConfig from 'src/config/db.config';

const configs: Array<ConfigFactory> = [appConfig, dbConfig, authConfig];

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: '.env',
      load: configs,
      isGlobal: true,
      expandVariables: true,
      validationSchema: Joi.object({
        // COMMON
        NODE_ENV: Joi.string().valid('production', 'development', 'staging').default('development'),
        PORT: Joi.number().valid(3000, 8080).default(3000),
        // DATABASE
        MONGO_URI: Joi.string().uri().default('mongodb://root:example@localhost:27017/grocery-store?authSource=admin'),
        // AUTH
        AUTH_SECRET: Joi.string().required(),
      }),
    }),
  ],
})
export class ConfigSetupModule {}
