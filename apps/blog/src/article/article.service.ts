import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { Includeable } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { ArticleImage } from '@app/common/entity/article-image.model';
import { Article } from '@app/common/entity/article.model';
import { ArticleStatus } from '@app/common/entity/enums/articlestatus.enum';
import { IArticle } from '@app/common/entity/interface/article.interface';
import { User } from '@app/common/entity/user.model';

import { BaseService } from '@app/common/core/services/base.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';

import { ArticleDto } from '@app/common/dto/blog/article/article.dto';
import { CreateArticleDto } from '@app/common/dto/blog/article/create-article.dto';
import { PublishArticleDto } from '@app/common/dto/blog/article/publish-article.dto';
import { RemoveArticleDto } from '@app/common/dto/blog/article/remove-article.dto';
import { UpdateArticleDto } from '@app/common/dto/blog/article/update-article.dto';
import { MessageDto } from '@app/common/dto/utils/message.dto';
import { PageDto } from '@app/common/dto/utils/page.dto';

@Injectable({ scope: Scope.REQUEST })
export class ArticleService extends BaseService {
  constructor(
    protected readonly sequelize: Sequelize,
    @InjectModel(Article) private readonly articleRepository: typeof Article,
    @InjectModel(ArticleImage)
    private readonly imageRepository: typeof ArticleImage,
    protected readonly tenantStateService: TenantStateService,
    @Inject('REDIS') protected readonly client: ClientProxy,
  ) {
    super(sequelize, tenantStateService, client);
  }

  /**
   * Creates a new article
   * @param dtoIn - The DTO containing the data of the article
   * @param userId - The id of the user creating the article
   * @returns The created article
   */
  public async create(
    dtoIn: CreateArticleDto,
    userId: string,
  ): Promise<ArticleDto> {
    // 1. Get tenant id
    const tenantId = this.getTenantId();

    // 2. Fetch the user
    const user = await this.getUserById(userId);

    // 3. Create article
    let article = this.buildArticle(dtoIn, userId, tenantId);

    await this.saveEntity(article, true);

    article.user = user;

    // 4. Attach image to article
    article = await this.attachImageToArticle(
      article,
      dtoIn.imageUrl,
      tenantId,
    );

    // 5. Return article with user
    return new ArticleDto(article); // Assuming you've created a new DTO or modified the existing one
  }

  private async getUserById(id: string): Promise<User> {
    return await this.getData<User>('get_user_by_id', id);
  }

  /**
   * Attaches an image to an article if imageUrl is provided
   * @param article - The article to which the image will be attached
   * @param imageUrl - The url of the image
   * @param tenantId - The id of the tenant
   * @returns The article with the image attached
   */
  private async attachImageToArticle(
    article: Article,
    imageUrl: string,
    tenantId: string,
  ): Promise<Article> {
    if (imageUrl) {
      const articleImage = this.imageRepository
        .schema(tenantId)
        .build({ url: imageUrl, articleId: article.id });
      article.image = articleImage;

      // Save the image
      await this.saveEntity(articleImage, true);
    }

    return article;
  }

  /**
   * Retrieves all articles according to the provided filters
   * @param dtoIn - The DTO containing the filters
   * @param userId - The id of the user
   * @returns An array of retrieved articles
   */
  public async findAll(
    dtoIn: PageDto,
    userId: string = null,
  ): Promise<ArticleDto[]> {
    // 1. Get tenant id
    const tenantId = this.getTenantId();

    // 2. Create options object for findAll
    const options = this.createFindOptions(tenantId, dtoIn, userId);

    // 3. Retrieve articles
    const articles = await this.articleRepository
      .schema(tenantId)
      .findAll(options);

    // 4. Map articles to ArticleDto
    return articles.map((article: IArticle) => new ArticleDto(article));
  }

  public async publish({ id }: PublishArticleDto, userId: string) {
    // 1. Validate ownership and get article
    const article: Article = await this.validateOwnershipOfArticle(
      id,
      userId,
      this.createIncludeOption(this.getTenantId()),
    );

    // 2. Change status to PUBLISHED and save
    await article.update({ status: ArticleStatus.PUBLISHED });
    await this.saveEntity(article);

    return new ArticleDto(article);
  }

  /**
   * Creates the options object for the findAll method
   * @param dtoIn - The DTO containing the filters
   * @param userId - The id of the user
   * @param tenantId - The id of the tenant
   * @returns The options object
   */
  private createFindOptions(
    tenantId: string,
    dtoIn?: PageDto,
    userId?: string,
  ): object {
    return {
      where: {
        ...this.createWhereOption(userId),
        ...this.createStatusOption(userId),
      },
      include: this.createIncludeOption(tenantId),
      ...((dtoIn && this.paginate(dtoIn.page, dtoIn.pageSize)) || {}),
      order: [['createdAt', 'DESC']],
      attributes: {
        include: [
          [
            this.sequelize.literal(`(
              SELECT COUNT(*)
              FROM "${this.getTenantId()}"."Comment" 
              WHERE 
                "Comment"."articleId" = "Article"."id"
            )`),
            'commentsCount',
          ],
        ],
      },
    };
  }

  private createWhereOption(userId: string): object {
    return userId ? { author: userId } : {};
  }

  private createStatusOption(userId: string): object {
    return !userId ? { status: ArticleStatus.PUBLISHED } : {};
  }

  private createIncludeOption(tenantId: string): object[] {
    return [
      { model: User.schema(tenantId), as: 'user' },
      { model: ArticleImage.schema(tenantId), as: 'image' },
    ];
  }

  /**
   * Retrieves a single article by its ID.
   * @param {string} id - The ID of the article to be retrieved.
   * @returns {Promise<ArticleDto>} - The retrieved article.
   */
  public async findOne(id: string): Promise<ArticleDto> {
    // 1. Get the tenant ID
    const tenantId = this.getTenantId();

    // 2. Generate options
    const options = this.createFindOptions(tenantId);

    // 3. Search for the article with the provided ID
    const article = await this.articleRepository
      .schema(tenantId)
      .findOne({ ...options, where: { id } });

    return new ArticleDto(article);
  }

  /**
   * Updates an existing article.
   * @param {UpdateArticleDto} dtoIn - The DTO containing the data to update the article.
   * @param {string} userId - The ID of the user updating the article.
   * @returns {Promise<ArticleDto>} - The updated article.
   */
  public async update(
    dtoIn: UpdateArticleDto,
    userId: string,
  ): Promise<ArticleDto> {
    // 1. Extract article ID, imageUrl and other data from the DTO
    const { id, imageUrl, ...data } = dtoIn;

    // 2. Validate that the user owns the article
    await this.validateOwnershipOfArticle(id, userId);

    // 3. Update the article
    const updatedArticle = await this.updateArticleAndImage(id, data, imageUrl);

    return new ArticleDto(updatedArticle);
  }

  /**
   * Removes an existing article.
   * @param {ArticleDto} dtoIn - The DTO containing the ID of the article to be removed.
   * @param {string} userId - The ID of the user removing the article.
   * @returns {Promise<MessageDto>} - A message indicating the removal of the article.
   */
  public async remove(
    dtoIn: RemoveArticleDto,
    userId: string,
  ): Promise<MessageDto> {
    // 1. Extract the article ID from the DTO
    const articleId = dtoIn.id;
    // 2. Validate that the user owns the article
    await this.validateOwnershipOfArticle(articleId, userId);
    // 3. Remove the article
    await this.articleRepository
      .schema(this.getTenantId())
      .destroy({ where: { id: articleId } });
    // 4. Return a success message
    return this.generateMessage(`Article ${articleId} removed`);
  }
  /**
   * Provides pagination based on the page number and size.
   * @param {number} page - The page number.
   * @param {number} pageSize - The number of items per page.
   * @returns {object} - The offset and limit for the query.
   */
  private paginate(page: number, pageSize: number): object {
    const offset: number = (page - 1) * pageSize;
    const limit = pageSize;
    // 1. Calculate the offset and limit
    return page && pageSize ? { offset, limit } : {};
  }

  /**
   * Validates if the current user is the owner of the article.
   * @param {string} articleId - The ID of the article.
   * @param {string} userId - The ID of the current user.
   * @throws {BadRequestException} - If the user doesn't own the article.
   */
  private async validateOwnershipOfArticle(
    articleId: string,
    userId: string,
    includeOptions?: Includeable[],
  ): Promise<Article> {
    // 1. Get article with the given ID and author
    const article = await this.articleRepository
      .schema(this.getTenantId())
      .findOne({
        where: { id: articleId, author: userId },
        ...(includeOptions ? { include: includeOptions } : {}),
      });

    this.isEntityExists(article, 'Article');

    return article;
  }

  private buildArticle(
    dtoIn: CreateArticleDto,
    userId: string,
    tenantId: string,
  ): Article {
    return this.articleRepository
      .schema(tenantId)
      .build({ ...dtoIn, author: userId });
  }

  private async updateArticleAndImage(
    id: string,
    data: any,
    imageUrl: string,
  ): Promise<Article> {
    const [numberOfAffectedRows, [updatedArticle]] =
      await this.articleRepository
        .schema(this.getTenantId())
        .update({ ...data }, { where: { id }, returning: true });
    if (imageUrl) {
      await this.imageRepository
        .schema(this.getTenantId())
        .update({ url: imageUrl }, { where: { articleId: id } });
      updatedArticle.image = await this.imageRepository
        .schema(this.getTenantId())
        .findOne({ where: { articleId: id } });
    }
    if (numberOfAffectedRows === 0) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return updatedArticle;
  }
}
