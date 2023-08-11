import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from '@app/common/core/exceptions/exception.filter';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(UsersModule);
  const configService = appContext.get(ConfigService);

  const redisHost = configService.get<string>('redis.host');
  const redisPort = configService.get<number>('redis.port');

  // Setup redis microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.REDIS,
      options: {
        host: redisHost,
        port: redisPort,
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen();
}
bootstrap();
