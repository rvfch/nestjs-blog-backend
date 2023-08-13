import { REDIS_HOST, REDIS_PORT } from '@app/common/constants/constants';
import { AllExceptionsFilter } from '@app/common/core/exceptions/exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(UsersModule);
  const configService = appContext.get(ConfigService);

  // Setup redis microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.REDIS,
      options: {
        host: configService.get<string>(REDIS_HOST),
        port: configService.get<number>(REDIS_PORT),
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen();
}
bootstrap();
