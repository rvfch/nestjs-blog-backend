import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@app/common';
import { DatabaseModule } from '@app/common/database/database.module';
import { config } from './config/app.config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@app/common/core/guards/auth.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { TenantMiddleware } from '@app/common/core/middleware/tenant.middleware';
import { ThrottlerConfig } from '@app/common/config/throttler.config';
import { configValidation } from './config/schema/app.config.schema';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { CacheConfig } from '@app/common/config/cache.config';
import { JwtService } from '@app/common/core/services/jwt.service';

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
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
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
