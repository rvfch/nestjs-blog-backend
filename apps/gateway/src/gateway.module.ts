import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/app.config';
import { configValidation } from './config/app.config.schema';
import { GatewayController } from './gateway.controller';
import { HealthModule } from './health/health.module';

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
