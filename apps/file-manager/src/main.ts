import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { FileManagerModule } from './file-manager.module';

async function bootstrap() {
  const app = await NestFactory.create(FileManagerModule);
  // Load configuration
  app.setGlobalPrefix('api/files');
  const configService = app.get(ConfigService);
  const APP_PORT = configService.get('PORT');
  const APP_NAME = configService.get('APP_NAME');
  app.useGlobalPipes(new ValidationPipe());
  // Security
  app.enableCors({
    credentials: true,
    origin: `http://${configService.get<string>('CLIENT_URI')}`,
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  // Listen requests
  await app.listen(APP_PORT, () =>
    console.log(`[${APP_NAME}] App running on port ${APP_PORT}`),
  );
}
bootstrap();
