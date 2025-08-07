import { registerAs } from '@nestjs/config';

/**
 * Usage i.e. configService.get<string>('app.port')
 */
export default registerAs('app', () => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
}));
