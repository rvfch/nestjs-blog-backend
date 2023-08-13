import { CacheConfig } from '@app/common/config/cache.config';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { Tenant } from '@app/common/entity/tenant.model';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { config } from './config/app.config';
import { configValidation } from './config/app.config.schema';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

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
