import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

/**
 * Usage i.e. configService.get<string>('database.uri')
 */
export default registerAs(
  'database',
  (): MongooseModuleOptions => ({
    uri: process.env.MONGO_URI,
  }),
);
