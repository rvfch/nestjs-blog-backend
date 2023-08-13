import { JwtModule } from '@app/common/core/services/jwt.module';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { Comment } from '@app/common/entity/comment.model';
import { Rating } from '@app/common/entity/rating.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PubSub } from 'graphql-subscriptions';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';

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
