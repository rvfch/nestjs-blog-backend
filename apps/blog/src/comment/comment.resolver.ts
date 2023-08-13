import { CurrentUser } from '@app/common/core/decorators/current-user.decorator';
import { Public } from '@app/common/core/decorators/public.decorator';
import { AuthGqlGuard } from '@app/common/core/guards/auth-gql.guard';
import { CommentDto } from '@app/common/dto/blog/comments/comment.dto';
import { CreateCommentDto } from '@app/common/dto/blog/comments/create-comment.dto';
import { RateCommentDto } from '@app/common/dto/blog/comments/rate-comment.dto';
import { Comment } from '@app/common/entity/comment.model';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { TenantGqlInterceptor } from './interceptors/tenant-gql.interceptor';

@UseGuards(AuthGqlGuard)
@UseInterceptors(TenantGqlInterceptor)
@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  /**
   * Create a new comment.
   * @param {CreateCommentDto} dto - Data Transfer Object for creating a comment.
   * @returns {CommentDto} The created comment.
   */
  @Mutation(() => CommentDto)
  public async createComment(@Args('dto') dto: CreateCommentDto) {
    return await this.commentService.createComment(dto);
  }

  /**
   * Get all comments associated with a given article.
   * @param {string} articleId - ID of the article.
   * @param {string} userId - ID of the current user.
   * @returns {CommentDto[]} List of comments for the article.
   */
  @Public()
  @Query(() => [CommentDto])
  public async getComments(
    @Args('articleId') articleId: string,
    @CurrentUser() userId: string,
  ): Promise<CommentDto[]> {
    return await this.commentService.getCommentsByArticleId(articleId, userId);
  }

  /**
   * Rate a given comment.
   * @param {RateCommentDto} dto - Data Transfer Object for rating a comment.
   * @returns {CommentDto} The rated comment.
   */
  @Mutation(() => CommentDto)
  public async rateComment(
    @Args('dto') dto: RateCommentDto,
  ): Promise<CommentDto> {
    return await this.commentService.rateComment(dto);
  }

  /**
   * Subscription for comment creation events.
   * @returns {AsyncIterator} Asynchronous iterator for comment creation events.
   */
  @Public()
  @Subscription(() => CommentDto)
  commentCreated() {
    return this.commentService.pubSub.asyncIterator('commentCreated');
  }

  /**
   * Subscription for comment rating events.
   * @returns {AsyncIterator} Asynchronous iterator for comment rating events.
   */
  @Public()
  @Subscription(() => CommentDto)
  commentRated() {
    return this.commentService.pubSub.asyncIterator('commentRated');
  }
}
