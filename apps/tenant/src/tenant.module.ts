import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/common/database/database.module';
import { config } from './config/app.config';
import { configValidation } from './config/app.config.schema';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tenant } from '@app/common/entity/tenant.model';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfig } from '@app/common/config/cache.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfig } from '@app/common/config/throttler.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidation,
      load: [config],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useClass: CacheConfig,
    }),
    DatabaseModule,
    SequelizeModule.forFeature([Tenant]),
  ],
  controllers: [TenantController],
  providers: [TenantService, TenantStateService],
})
export class TenantModule {}
