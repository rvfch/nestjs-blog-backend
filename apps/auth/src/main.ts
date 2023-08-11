import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ValidationPipe } from '@nestjs/common';
import { RedisService } from '@app/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import * as Constants from '@app/common/constants/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from '@app/common/core/exceptions/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  // Load configuration
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  const APP_PORT = configService.get(Constants.PORT);
  const APP_NAME = configService.get(Constants.APP_NAME);
  // Setup Swagger
  const documentConfig = new DocumentBuilder()
    .setTitle('Authentication')
    .setDescription('Authentication API description')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth()
    .addCookieAuth(configService.get('cookieSecret'))
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api', app, document);
  // Setup Redis as transport layer
  const redisService = app.get<RedisService>(RedisService);
  app.connectMicroservice<MicroserviceOptions>(redisService.getOptions());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  // Security
  app.use(cookieParser(configService.get<string>('cookieSecret')));
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin: `http://${configService.get<string>('clientUri')}`,
  });
  // Startup
  await app.startAllMicroservices();
  // Listen requests
  await app.listen(APP_PORT, () =>
    console.log(`[${APP_NAME}] App running on port ${APP_PORT}`),
  );
}
bootstrap();
