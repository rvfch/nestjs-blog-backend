import { NestFactory } from '@nestjs/core';
import { BlogModule } from './blog.module';
import { RedisService } from '@app/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Constants from '@app/common/constants/constants';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from '@app/common/core/exceptions/exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(BlogModule);
  // Load configuration
  app.setGlobalPrefix('api/blog');
  const configService = app.get(ConfigService);
  const APP_PORT = configService.get(Constants.PORT);
  const APP_NAME = configService.get(Constants.APP_NAME);
  const DEBUG = configService.get('debug');
  // Setup Swagger
  const documentConfig = new DocumentBuilder()
    .setTitle('Blog')
    .setDescription('Blog API description')
    .setVersion('1.0')
    .addTag('blog')
    .addBearerAuth()
    .addCookieAuth(configService.get('cookieSecret'))
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api', app, document);
  // Setup Redis as transport layer
  const redisService = app.get<RedisService>(RedisService);
  app.connectMicroservice<MicroserviceOptions>(redisService.getOptions());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // Security
  app.enableCors({
    credentials: true,
    origin: `http://${configService.get<string>('CLIENT_URI')}`,
  });
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
  if (!DEBUG) {
    app.use(helmet());
  }
  // Startup
  await app.startAllMicroservices();
  // Listen requests
  await app.listen(APP_PORT, () =>
    console.log(`[${APP_NAME}] App running on port ${APP_PORT}`),
  );
}
bootstrap();
