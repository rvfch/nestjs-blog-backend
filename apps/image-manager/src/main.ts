import { NestFactory } from '@nestjs/core';
import { ImageManagerModule } from './image-manager.module';
import { RedisService } from '@app/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Constants from '@app/common/constants/constants';

async function bootstrap() {
  const app = await NestFactory.create(ImageManagerModule);
  // Load configuration
  const configService = app.get(ConfigService);
  const APP_PORT = configService.get(Constants.PORT);
  const APP_NAME = configService.get(Constants.APP_NAME);
  // Setup Redis as transport layer
  const redisService = app.get<RedisService>(RedisService);
  app.connectMicroservice<MicroserviceOptions>(redisService.getOptions());
  app.useGlobalPipes(new ValidationPipe());
  await app.startAllMicroservices();
  // Listen requests
  await app.listen(APP_PORT, () =>
    console.log(`[${APP_NAME}] App running on port ${APP_PORT}`),
  );
}
bootstrap();
