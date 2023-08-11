import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/common/database/database.module';
import { configValidation } from './config/schema/app.config.schema';
import { config } from './config/app.config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@app/common/entity/user.model';
import { Credentials } from '@app/common/entity/credentials.model';
import { BlacklistedToken } from '@app/common/entity/blacklisted-token.model';
import { BlacklistedTokenService } from './blacklisted-token/blacklisted-token.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfig } from '@app/common/config/throttler.config';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfig } from '@app/common/config/cache.config';

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
    SequelizeModule.forFeature([User, Credentials, BlacklistedToken]),
  ],
  controllers: [UsersController],
  providers: [UsersService, BlacklistedTokenService, TenantStateService],
})
export class UsersModule {}
