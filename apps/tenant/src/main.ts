import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TenantModule } from './tenant.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(TenantModule);
  const configService = appContext.get(ConfigService);

  const redisHost = configService.get<string>('redis.host');
  const redisPort = configService.get<number>('redis.port');

  // Setup redis microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TenantModule,
    {
      transport: Transport.REDIS,
      options: {
        host: redisHost,
        port: redisPort,
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen();
}
bootstrap();
