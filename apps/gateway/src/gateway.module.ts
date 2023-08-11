import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import { configValidation } from './config/app.config.schema';
import { config } from './config/app.config';
import { GatewayController } from './gateway.controller';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidation,
      load: [config],
    }),
    HealthModule,
  ],
  controllers: [GatewayController],
})
export class GatewayModule {}
