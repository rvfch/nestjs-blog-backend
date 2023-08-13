import { configBase } from '@app/common/config/config.base';
import { baseConfigValidation } from '@app/common/config/config.schema';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from './jwt.service';
import { TenantStateService } from './tenant-state.service';

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
export class JwtModule {}
