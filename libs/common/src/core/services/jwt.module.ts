import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { TenantStateService } from './tenant-state.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configBase } from '@app/common/config/config.base';
import { baseConfigValidation } from '@app/common/config/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: baseConfigValidation,
      load: [() => configBase],
    }),
  ],
  providers: [TenantStateService, JwtService],
  exports: [JwtService],
})
export class JwtModule {
  constructor() {}
}
