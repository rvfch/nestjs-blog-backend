import { REDIS_HOST, REDIS_PORT } from '@app/common/constants/constants';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TenantModule } from './tenant.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(TenantModule);
  const configService = appContext.get(ConfigService);

  // Setup redis microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TenantModule,
    {
      transport: Transport.REDIS,
      options: {
        host: configService.get<string>(REDIS_HOST),
        port: configService.get<number>(REDIS_PORT),
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen();
}
bootstrap();
