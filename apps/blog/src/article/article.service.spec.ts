import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ArticleController } from './article.controller';
import { Test } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { ArticleStatus } from '@app/common/entity/enums/articlestatus.enum';
import { ArticleDto } from '@app/common/dto/blog/article/article.dto';
import { JwtService } from '@app/common/core/services/jwt.service';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ContextIdFactory, Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { getModelToken } from '@nestjs/sequelize';
import { Article } from '@app/common/entity/article.model';
import { ArticleImage } from '@app/common/entity/article-image.model';
import { MessageDto } from '@app/common/dto/utils/message.dto';
import {
  generateRandomUUID4,
  getMockArticles,
  mockRequestWithTenantId,
  mockSequelize,
  mockUser,
} from '@app/common/helpers/test.helpers';
import { UserDto } from '@app/common/dto/users/user.dto';
import { CreateArticleDto } from '@app/common/dto/blog/article/create-article.dto';
import { User } from '@app/common/entity/user.model';
import { Comment } from '@app/common/entity/comment.model';
import { BlacklistedToken } from '@app/common/entity/blacklisted-token.model';
import { Tenant } from '@app/common/entity/tenant.model';
import { UserImage } from '@app/common/entity/user-image.model';
import { Credentials } from '@app/common/entity/credentials.model';
import { Rating } from '@app/common/entity/rating.model';
import { Sequelize } from 'sequelize-typescript';
import sinon from 'sinon';

const moduleMocker = new ModuleMocker(global);

let user: UserDto;

const articles: ArticleDto[] = getMockArticles();

const articleToCreate: CreateArticleDto = articles[0];

const article: ArticleDto = articles[0];

const publishedArticle: ArticleDto = {
  ...article,
  status: ArticleStatus.PUBLISHED,
};

const updatedArticle: ArticleDto = {
  ...article,
  title: 'Updated title',
  content: 'Updated content',
  perex: 'Updated perex',
};

const removeArticleMsg = (articleId: string): MessageDto => ({
  message: `Article ${articleId} removed`,
  id: generateRandomUUID4(),
});

describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: JwtService,
          useValue: jest.mock('@app/common/core/services/jwt.service'),
        },
        {
          provide: ThrottlerStorage,
          useValue: jest.mock('@nestjs/throttler'),
        },
        {
          provide: Reflector,
          useValue: jest.mock('@nestjs/core'),
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        TenantStateService,
        {
          provide: Sequelize,
          useValue: sinon.createStubInstance(Sequelize),
        },
        {
          provide: getModelToken(Article),
          useValue: sinon.createStubInstance(Article),
        },
        {
          provide: getModelToken(ArticleImage),
          useValue: sinon.createStubInstance(ArticleImage),
        },
        {
          provide: getModelToken(User),
          useValue: sinon.createStubInstance(User),
        },
        {
          provide: getModelToken(Comment),
          useValue: sinon.createStubInstance(Comment),
        },
        {
          provide: getModelToken(BlacklistedToken),
          useValue: sinon.createStubInstance(BlacklistedToken),
        },
        {
          provide: getModelToken(Tenant),
          useValue: sinon.createStubInstance(Tenant),
        },
        {
          provide: getModelToken(UserImage),
          useValue: sinon.createStubInstance(UserImage),
        },
        {
          provide: getModelToken(Credentials),
          useValue: sinon.createStubInstance(Credentials),
        },
        {
          provide: getModelToken(Rating),
          useValue: sinon.createStubInstance(Rating),
        },
        {
          provide: 'REDIS',
          useValue: {},
        },
        {
          provide: 'THROTTLER:MODULE_OPTIONS',
          useValue: {},
        },
      ],
    })
      .useMocker((token) => {
        if (token === ArticleService) {
          return {
            create: jest.fn().mockResolvedValue(article),
            findAll: jest.fn().mockResolvedValue(articles),
            findOne: jest.fn().mockResolvedValue(article),
            publish: jest.fn().mockResolvedValue(publishedArticle),
            update: jest.fn().mockResolvedValue(updatedArticle),
            remove: jest.fn().mockResolvedValue(removeArticleMsg),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    service = await moduleRef.resolve(ArticleService, contextId);

    user = mockUser();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findAll', () => {
    it('should return all articles', async () => {
      mockSequelize.findAll = jest.fn().mockResolvedValue(articles);

      const query = {
        page: 1,
        pageSize: 10,
      };

      expect(await service.findAll(query)).toEqual(articles);
      expect(mockSequelize.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single article', async () => {
      mockSequelize.findOne = jest.fn().mockResolvedValue(article);

      expect(await service.findOne(article.id)).toEqual(article);
      expect(mockSequelize.findOne).toHaveBeenCalledWith({
        where: { id: article.id },
      });
    });
  });

  describe('create', () => {
    it('should create a new article', async () => {
      mockSequelize.create = jest.fn().mockResolvedValue(article);

      expect(await service.create(articleToCreate, user.id)).toEqual(article);
      expect(mockSequelize.create).toHaveBeenCalledWith(articleToCreate);
    });
  });

  describe('myArticles', () => {
    it('should return an array of articles for the current user', async () => {
      mockSequelize.findAll = jest.fn().mockResolvedValue(articles);

      const query = {
        page: 1,
        pageSize: 10,
      };

      expect(await service.findAll(query, user.id)).toEqual(articles);
      expect(mockSequelize.findAll).toHaveBeenCalledWith({
        where: { userId: user.id },
      });
    });
  });

  describe('publish', () => {
    it('should return article with status published', async () => {
      mockSequelize.findOne = jest.fn().mockResolvedValue(publishedArticle);

      // Mocking the update method
      mockSequelize.update = jest.fn().mockResolvedValue([1]);

      await service.publish(publishedArticle, user.id);

      expect(mockSequelize.findOne).toHaveBeenCalledWith({
        where: { id: publishedArticle.id },
      });
      expect(mockSequelize.update).toHaveBeenCalledWith(
        { status: ArticleStatus.PUBLISHED },
        { where: { id: publishedArticle.id } },
      );
    });
  });

  describe('update', () => {
    it('should return an array of articles for the current user', async () => {
      mockSequelize.update = jest.fn().mockResolvedValue([1]);

      await service.update(updatedArticle, user.id);
      expect(mockSequelize.update).toHaveBeenCalledWith(updatedArticle, {
        where: { id: article.id },
      });
    });
  });

  describe('remove', () => {
    it('should return an array of articles for the current user', async () => {
      mockSequelize.destroy = jest.fn().mockResolvedValue(1);

      await service.remove(article, user.id);
      expect(mockSequelize.destroy).toHaveBeenCalledWith({
        where: { id: article.id },
      });
    });
  });
});
