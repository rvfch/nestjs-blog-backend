import { POSTGRES_DUPLICATE_ERROR_MESSAGE } from '@app/common/constants/constants';
import { CommentDto } from '@app/common/dto/blog/comments/comment.dto';
import { CreateCommentDto } from '@app/common/dto/blog/comments/create-comment.dto';
import { RateCommentDto } from '@app/common/dto/blog/comments/rate-comment.dto';
import { UpdateCommentDto } from '@app/common/dto/blog/comments/update-comment.dto';
import { Comment } from '@app/common/entity/comment.model';
import { IComment } from '@app/common/entity/interface/comment.interface';
import { Rating } from '@app/common/entity/rating.model';
import { User } from '@app/common/entity/user.model';
import { isNull, isUndefined } from '@app/common/helpers/validation.helpers';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PubSubEngine } from 'graphql-subscriptions';
import { QueryTypes, UniqueConstraintError } from 'sequelize';
import { Model, Sequelize } from 'sequelize-typescript';

@Injectable()
export class CommentService {
  // Refactor this service to use principles as SOLID, DRY, KISS, YAGNI
  private tenantId: string;

  constructor(
    protected readonly sequelize: Sequelize,
    @InjectModel(Comment) private readonly commentRepository: typeof Comment,
    @InjectModel(Rating) private readonly ratingRepository: typeof Rating,
    @Inject('PUB_SUB') public readonly pubSub: PubSubEngine,
  ) {}

  private setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  public async handleTenantId(tenantId: string): Promise<void> {
    // Format the tenant ID to be lowercase and remove any whitespace.
    const formattedTenantId = this.formatTenantId(tenantId);
    // Check if the tenant ID exists in the database.
    try {
      await this.checkTenantExists(formattedTenantId);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to check tenant exists: ${error.message}`,
      );
    }
    // Set the tenant ID.
    this.setTenantId(formattedTenantId);
  }

  public async checkTenantExists(tenantId: string): Promise<void> {
    let tenantExists: boolean;
    // TODO: add caching
    try {
      const result = await this.sequelize.query(
        `SELECT TRUE FROM information_schema.schemata WHERE schema_name = $schemaName`,
        {
          bind: { schemaName: tenantId },
          type: QueryTypes.SELECT,
        },
      );

      tenantExists = result && result.length > 0;
    } catch (e) {
      throw new InternalServerErrorException('Unable to verify tenant.');
    }

    if (!tenantExists) {
      throw new BadRequestException(
        'Tenant not exists. Please create new tenant, using api/tenantLogin.',
      );
    }
  }

  private formatTenantId(tenantId: string): string | null {
    if (!isNull(tenantId) && !isUndefined(tenantId)) {
      if (tenantId.includes('tenant_')) {
        return tenantId;
      } else {
        return `tenant_${tenantId}`;
      }
    }
    return null;
  }

  /**
   * This function checks PostgreSQL duplicate error 23505
   *
   * @param promise: Promise<T>
   * @param message?: string
   * @return promise
   * @throw 409 or 400
   */
  public async throwDuplicateError<T>(promise: Promise<T>, message?: string) {
    try {
      return await promise;
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException(
          message ?? POSTGRES_DUPLICATE_ERROR_MESSAGE,
        );
      }
      throw new BadRequestException(e.message);
    }
  }

  /**
   * This function validates the entity
   *
   * @param entity: Model
   * @return Promise<void>
   * @throw 400
   */
  public async validateEntity(entity: Model): Promise<void> {
    const errors: string[] = [];
    // 1. Validate entity
    try {
      await entity.validate();
    } catch (e) {
      // 2. Process errors
      e.errors?.forEach((e) => {
        errors.push(e.message);
      });
    }
    // 3. IF errors THEN throw 400
    if (errors.length > 0) {
      throw new BadRequestException(errors.join(',\n'));
    }
  }

  public async saveEntity<T extends Model>(
    entity: T,
    isNew = false,
  ): Promise<void> {
    await this.validateEntity(entity);
    await this.throwDuplicateError(
      this.sequelize.transaction(async (t) => {
        if (isNew) {
          await entity.save({ transaction: t });
        }
      }),
    );
  }

  public async createComment(dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepository.schema(this.tenantId).build(dto);
    await this.saveEntity(comment, true);
    await this.pubSub.publish('commentCreated', { commentCreated: comment });

    return comment;
  }

  public async getCommentsByArticleId(
    articleId: string,
    currentUserId?: string,
  ): Promise<CommentDto[]> {
    // Retrieve all comments for the article
    const comments = await this.commentRepository
      .schema(this.tenantId)
      .findAll({
        where: { articleId },
        include: [User.schema(this.tenantId)],
        order: [['createdAt', 'DESC']],
      });

    // Convert the list of comments into a nested structure
    const nestedComments = this.nestComments(comments);

    if (currentUserId) {
      // Fetch all ratings by the current user for these comments
      const ratedCommentIds = await this.ratingRepository
        .schema(this.tenantId)
        .findAll({
          where: {
            userId: currentUserId,
            commentId: comments.map((comment) => comment.id),
          },
          attributes: ['commentId'],
          raw: true,
        })
        .then((ratings) => ratings.map((rating) => rating.commentId));

      // Mark the comments that the user has already voted on
      const annotatedComments = this.annotateCommentsWithCanVote(
        nestedComments,
        ratedCommentIds,
      );
      return annotatedComments.map(
        (comment: IComment) => new CommentDto(comment),
      );
    }
    return nestedComments.map((comment: IComment) => new CommentDto(comment));
  }

  private annotateCommentsWithCanVote(
    comments: any[],
    ratedCommentIds: string | any[],
  ) {
    return comments.map((comment) => {
      comment.canVote = !ratedCommentIds.includes(comment.id);

      // Recursive call for child comments
      if (comment.children && comment.children.length > 0) {
        comment.children = this.annotateCommentsWithCanVote(
          comment.children,
          ratedCommentIds,
        );
      }

      return comment;
    });
  }

  private nestComments(comments: IComment[]) {
    const commentMap = {};
    const rootComments = [];

    // Create a map of comment id => comment. Also, initialize children
    comments.forEach((comment) => {
      comment.children = [];
      commentMap[comment.id] = comment;
    });

    comments.forEach((comment) => {
      if (comment.parentId) {
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].children.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  public async getCommentById(id: string): Promise<Comment> {
    const comment = await this.commentRepository
      .schema(this.tenantId)
      .findByPk(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  public async updateComment(dtoIn: UpdateCommentDto): Promise<Comment> {
    const { id, ...data } = dtoIn;

    const [numberOfAffectedRows, [updatedComment]] =
      await this.commentRepository
        .schema(this.tenantId)
        .update({ ...data }, { where: { id }, returning: true });

    if (numberOfAffectedRows === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return updatedComment;
  }

  public async removeComment(id: string): Promise<void> {
    const comment = await this.commentRepository
      .schema(this.tenantId)
      .findByPk(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.commentRepository.destroy({ where: { id } });
  }

  public async rateComment(dtoIn: RateCommentDto): Promise<CommentDto> {
    const { userId, commentId } = dtoIn;

    const existingRating = await this.ratingRepository
      .schema(this.tenantId)
      .findOne({
        where: {
          userId,
          commentId,
        },
      });

    if (existingRating) {
      throw new BadRequestException('User has already rated this comment');
    }

    const rating = this.ratingRepository.schema(this.tenantId).build(dtoIn);
    await this.saveEntity(rating, true);

    // Update comment ratingScore
    if (dtoIn.isUpvote) {
      await this.commentRepository
        .schema(this.tenantId)
        .increment('ratingScore', { where: { id: commentId } });
    } else if (dtoIn.isUpvote === false) {
      await this.commentRepository
        .schema(this.tenantId)
        .decrement('ratingScore', { where: { id: commentId } });
    }

    // Fetch the updated comment data
    const updatedComment = await this.commentRepository
      .schema(this.tenantId)
      .findOne({
        where: { id: commentId },
        include: [User.schema(this.tenantId)],
      });

    if (!updatedComment) {
      throw new Error('Failed to retrieve updated comment data after rating.');
    }

    await this.pubSub.publish('commentRated', { commentRated: updatedComment });

    return new CommentDto(updatedComment, false);
  }
}
