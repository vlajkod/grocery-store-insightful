import { registerAs } from '@nestjs/config';

/**
 * Usage i.e. configService.get<string>('auth.secret')
 */
export default registerAs('auth', () => ({
  secret: process.env.AUTH_SECRET,
  expiresIn: '6000s', // Adjust as needed, e.g., '1d' for 1 day
}));
