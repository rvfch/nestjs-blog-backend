import { Resolver, Mutation, Args, Subscription, Query } from '@nestjs/graphql';
import { Comment } from '@app/common/entity/comment.model';
import { Rating } from '@app/common/entity/rating.model';
import { RateCommentDto } from '@app/common/dto/blog/comments/rate-comment.dto';
import { CommentService } from './comment.service';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGqlGuard } from '@app/common/core/guards/auth-gql.guard';
import { TenantGqlInterceptor } from './interceptors/tenant-gql.interceptor';
import { CreateCommentDto } from '@app/common/dto/blog/comments/create-comment.dto';
import { IComment } from '@app/common/entity/interface/comment.interface';
import { CommentDto } from '@app/common/dto/blog/comments/comment.dto';
import { CurrentUser } from '@app/common/core/decorators/current-user.decorator';
import { Public } from '@app/common/core/decorators/public.decorator';

@UseGuards(AuthGqlGuard)
@UseInterceptors(TenantGqlInterceptor)
@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => CommentDto)
  public async createComment(@Args('dto') dto: CreateCommentDto) {
    return await this.commentService.createComment(dto);
  }

  @Public()
  @Query(() => [CommentDto])
  public async getComments(
    @Args('articleId') articleId: string,
    @CurrentUser() userId: string,
  ): Promise<CommentDto[]> {
    return await this.commentService.getCommentsByArticleId(articleId, userId);
  }

  @Mutation(() => CommentDto)
  public async rateComment(
    @Args('dto') dto: RateCommentDto,
  ): Promise<CommentDto> {
    return await this.commentService.rateComment(dto);
  }

  @Public()
  @Subscription(() => CommentDto)
  commentCreated() {
    return this.commentService.pubSub.asyncIterator('commentCreated');
  }

  @Public()
  @Subscription(() => CommentDto)
  commentRated() {
    return this.commentService.pubSub.asyncIterator('commentRated');
  }
}
