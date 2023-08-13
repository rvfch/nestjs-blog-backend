import { CacheConfig } from '@app/common/config/cache.config';
import { ThrottlerConfig } from '@app/common/config/throttler.config';
import { TenantMiddleware } from '@app/common/core/middleware/tenant.middleware';
import { JwtModule } from '@app/common/core/services/jwt.module';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { RedisModule } from '@app/common/redis/redis.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { Context } from 'graphql-ws';
import { ArticleModule } from './article/article.module';
import { BlogController } from './blog.controller';
import { CommentModule } from './comment/comment.module';
import { config } from './config/app.config';
import { configValidation } from './config/app.config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidation,
      load: [config],
    }),
    RedisModule,
    DatabaseModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfig,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useClass: CacheConfig,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async () => ({
        context: ({ req }) => {
          return req;
        },
        autoSchemaFile: true,
        subscriptions: {
          'graphql-ws': {
            onConnect: (context: Context<any>) => {
              const { connectionParams } = context;
              return {
                req: {
                  headers: {
                    authorization: connectionParams.authorization,
                    'x-api-key': connectionParams['x-api-key'],
                  },
                },
              };
            },
            path: '/graphql',
          },
        },
        include: [CommentModule],
        playground: true,
      }),
    }),
    ArticleModule,
    CommentModule,
    JwtModule,
  ],
  providers: [TenantStateService],
  controllers: [BlogController],
})
export class BlogModule {
  // Setup middleware for multi-tenancy
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: 'ping', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
