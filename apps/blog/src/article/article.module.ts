import { REDIS_HOST, REDIS_PORT } from '@app/common/constants/constants';
import { TenantMiddleware } from '@app/common/core/middleware/tenant.middleware';
import { JwtModule } from '@app/common/core/services/jwt.module';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { ArticleImage } from '@app/common/entity/article-image.model';
import { Article } from '@app/common/entity/article.model';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

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
            host: configService.get<string>(REDIS_HOST),
            port: configService.get<number>(REDIS_PORT),
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
