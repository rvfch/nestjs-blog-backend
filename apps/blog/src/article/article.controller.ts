import { BaseController } from '@app/common/core/controllers/base.controller';
import { CurrentUser } from '@app/common/core/decorators/current-user.decorator';
import { Public } from '@app/common/core/decorators/public.decorator';
import { AllExceptionsFilter } from '@app/common/core/exceptions/exception.filter';
import { AuthGuard } from '@app/common/core/guards/auth.guard';
import { ArticleDto } from '@app/common/dto/blog/article/article.dto';
import { PublishArticleDto } from '@app/common/dto/blog/article/publish-article.dto';
import { RemoveArticleDto } from '@app/common/dto/blog/article/remove-article.dto';
import { UpdateArticleDto } from '@app/common/dto/blog/article/update-article.dto';
import { MessageDto } from '@app/common/dto/utils/message.dto';
import { RequestWithTenantId } from '@app/common/utils/express/request-with-tenant';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateArticleDto } from '../../../../libs/common/src/dto/blog/article/create-article.dto';
import { ArticleService } from './article.service';

@ApiTags('article')
@UseGuards(ThrottlerGuard)
@UseGuards(AuthGuard)
@UseFilters(AllExceptionsFilter)
@Controller('article')
export class ArticleController extends BaseController {
  constructor(private readonly articleService: ArticleService) {
    super(articleService);
  }

  /**
   * Creates a new article
   * @param {RequestWithTenantId} req - The request object.
   * @param {string} userId - The ID of the current user.
   * @param {CreateArticleDto} dtoIn - The DTO with data to create the article.
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an article' })
  @ApiResponse({
    status: 201,
    description: 'The article has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async create(
    @Req() req: RequestWithTenantId,
    @CurrentUser() userId: string,
    @Body() dtoIn: CreateArticleDto,
  ): Promise<ArticleDto> {
    return await this.articleService.create(dtoIn, userId);
  }

  /**
   * Retrieves all articles.
   * @param {ArticleDtoIn} dtoIn - The DTO with filters for retrieving articles.
   * @param {RequestWithTenantId} req - The request object.
   */
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all articles' })
  @ApiResponse({ status: 200, description: 'List of all articles.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async findAll(
    @Query() query: { page: number; pageSize: number },
    @Req() req: RequestWithTenantId,
  ): Promise<ArticleDto[]> {
    return await this.articleService.findAll(query);
  }

  /**
   * Retrieves all articles of the current user.
   * @param {ArticleDtoIn} dtoIn - The DTO with filters for retrieving articles.
   * @param {string} userId - The ID of the current user.
   * @param {RequestWithTenantId} req - The request object.
   */
  @UseInterceptors(CacheInterceptor)
  @Get('myArticles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve current user articles' })
  @ApiResponse({
    status: 200,
    description: 'List of all articles of the current user.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async myArticles(
    @Query() query: { page: number; pageSize: number },
    @CurrentUser() userId: string,
    @Req() req: RequestWithTenantId,
  ): Promise<ArticleDto[]> {
    return await this.articleService.findAll(query, userId);
  }

  /**
   * Retrieves an article by its id.
   * @param {string} id - The ID of the article.
   * @param {RequestWithTenantId} req - The request object.
   */
  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve an article by id' })
  @ApiResponse({ status: 200, description: 'Return the article.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async findOne(
    @Param('id') id: string,
    @Req() req: RequestWithTenantId,
  ): Promise<ArticleDto> {
    return await this.articleService.findOne(id);
  }

  /**
   * Publish article
   * @param {RequestWithTenantId} req - The request object.
   * @param {string} userId - The ID of the current user.
   * @param {CreateArticleDto} dtoIn - The DTO with data to create the article.
   */
  @Post('publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully published.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async publish(
    @Req() req: RequestWithTenantId,
    @CurrentUser() userId: string,
    @Body() dtoIn: PublishArticleDto,
  ) {
    return await this.articleService.publish(dtoIn, userId);
  }

  /**
   * Updates an article.
   * @param {UpdateArticleDto} dtoIn - The DTO with data to update the article.
   * @param {RequestWithTenantId} req - The request object.
   * @param {string} userId - The ID of the current user.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async update(
    @Body() dtoIn: UpdateArticleDto,
    @Req() req: RequestWithTenantId,
    @CurrentUser() userId: string,
  ): Promise<ArticleDto> {
    return await this.articleService.update(dtoIn, userId);
  }

  /**
   * Deletes an article.
   * @param {RequestWithTenantId} req - The request object.
   * @param {RemoveArticleDto} dtoIn - The DTO with data to delete the article.
   * @param {string} userId - The ID of the current user.
   */
  @Delete('/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async remove(
    @Req() req: RequestWithTenantId,
    @Body() dtoIn: RemoveArticleDto,
    @CurrentUser() userId: string,
  ): Promise<MessageDto> {
    return await this.articleService.remove(dtoIn, userId);
  }
}
