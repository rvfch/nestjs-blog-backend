import { BaseController } from '@app/common/core/controllers/base.controller';
import { CurrentUser } from '@app/common/core/decorators/current-user.decorator';
import { Public } from '@app/common/core/decorators/public.decorator';
import { AllExceptionsFilter } from '@app/common/core/exceptions/exception.filter';
import { AuthGuard } from '@app/common/core/guards/auth.guard';
import { ArticleDto } from '@app/common/dto/blog/article/article.dto';
import { UpdateArticleDto } from '@app/common/dto/blog/article/update-article.dto';
import { MessageDto } from '@app/common/dto/utils/message.dto';
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
   * @param {string} userId - The ID of the current user.
   * @param {CreateArticleDto} dtoIn - The DTO with data to create the article.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an article' })
  @ApiResponse({
    status: 201,
    description: 'The article has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async create(
    @CurrentUser() userId: string,
    @Body() dtoIn: CreateArticleDto,
  ): Promise<ArticleDto> {
    return await this.articleService.create(dtoIn, userId);
  }

  /**
   * Retrieves all articles or user's articles if the query param mine is true.
   * @param {PageDto} dtoIn - The DTO with filters for retrieving articles.
   */
  @UseInterceptors(CacheInterceptor)
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all articles' })
  @ApiResponse({ status: 200, description: 'List of all articles.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async findAll(
    @Query() query: { page: number; pageSize: number; mine?: boolean },
    @CurrentUser() userId?: string,
  ): Promise<ArticleDto[]> {
    if (query.mine) return await this.articleService.findAll(query, userId);
    return await this.articleService.findAll(query);
  }

  /**
   * Retrieves an article by its id.
   * @param {string} id - The ID of the article.
   */
  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve an article by id' })
  @ApiResponse({ status: 200, description: 'Return the article.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async findOne(@Param('id') id: string): Promise<ArticleDto> {
    return await this.articleService.findOne(id);
  }

  /**
   * Publish article
   * @param {string} userId - The ID of the current user.
   * @param {string} id - Article ID to publish
   */
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully published.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async publish(@Param('id') id: string, @CurrentUser() userId: string) {
    return await this.articleService.publish(id, userId);
  }

  /**
   * Updates an article.
   * @param {string} id - Article ID to update
   * @param {UpdateArticleDto} dtoIn - The DTO with data to update the article.
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
    @Param('id') id: string,
    @Body() dtoIn: UpdateArticleDto,
    @CurrentUser() userId: string,
  ): Promise<ArticleDto> {
    return await this.articleService.update({ ...dtoIn, id }, userId);
  }

  /**
   * Deletes an article.
   * @param {string} id - Article ID to remove
   * @param {string} userId - The ID of the current user.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  public async remove(
    @Param('id') id: string,
    @CurrentUser() userId: string,
  ): Promise<MessageDto> {
    return await this.articleService.remove(id, userId);
  }
}
