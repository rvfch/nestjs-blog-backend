import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Article } from '@app/common/entity/article.model';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { ArticleImage } from '@app/common/entity/article-image.model';
import { TenantMiddleware } from '@app/common/core/middleware/tenant.middleware';
import { JwtModule } from '@app/common/core/services/jwt.module';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [SequelizeModule.forFeature([Article, ArticleImage]), JwtModule],
  controllers: [ArticleController],
  providers: [
    ArticleService,
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
  ],
})
export class ArticleModule {
  // Setup middleware for multi-tenancy
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude({ path: 'ping', method: RequestMethod.GET })
      .forRoutes('*');
  }
}
