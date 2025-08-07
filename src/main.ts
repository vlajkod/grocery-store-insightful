import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ Application is running on: ${await app.getUrl()}`);
  console.log(`📄 Swagger UI is available at: ${await app.getUrl()}/api/docs`);
}
bootstrap().catch((err) => {
  console.error('❌ Failed to start Nest application', err);
  process.exit(1);
});
