import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PubSub } from 'graphql-subscriptions';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from '@app/common/entity/comment.model';
import { Rating } from '@app/common/entity/rating.model';
import { CommentResolver } from './comment.resolver';
import { JwtModule } from '@app/common/core/services/jwt.module';
import { TenantMiddleware } from '@app/common/core/middleware/tenant.middleware';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';

@Module({
  imports: [SequelizeModule.forFeature([Comment, Rating]), JwtModule],
  providers: [
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
    CommentService,
    CommentResolver,
    TenantStateService,
  ],
  exports: [CommentService],
})
export class CommentModule {}
