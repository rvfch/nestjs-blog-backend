import { CacheConfig } from '@app/common/config/cache.config';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { BlacklistedToken } from '@app/common/entity/blacklisted-token.model';
import { Credentials } from '@app/common/entity/credentials.model';
import { User } from '@app/common/entity/user.model';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { BlacklistedTokenService } from './blacklisted-token/blacklisted-token.service';
import { config } from './config/app.config';
import { configValidation } from './config/schema/app.config.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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
