import { RedisModule } from '@app/common';
import { CacheConfig } from '@app/common/config/cache.config';
import { ThrottlerConfig } from '@app/common/config/throttler.config';
import { REDIS_HOST, REDIS_PORT } from '@app/common/constants/constants';
import { AuthGuard } from '@app/common/core/guards/auth.guard';
import { TenantMiddleware } from '@app/common/core/middleware/tenant.middleware';
import { JwtService } from '@app/common/core/services/jwt.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { config } from './config/app.config';
import { configValidation } from './config/schema/app.config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidation,
      load: [config],
    }),
    DatabaseModule,
    RedisModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useClass: CacheConfig,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    TenantStateService,
    {
      provide: 'REDIS',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>(REDIS_HOST),
            port: configService.get<number>(REDIS_PORT),
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {
  // Setup middleware for multi-tenancy
  // X-API-KEY must be in all routers, excluded tenant login route
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude('/auth/tenantLogin')
      .exclude('/auth/ping')
      .forRoutes(AuthController);
  }
}
