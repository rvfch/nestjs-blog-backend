import { JwtService } from '@app/common/core/services/jwt.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { ArticleDto } from '@app/common/dto/blog/article/article.dto';
import { UserDto } from '@app/common/dto/users/user.dto';
import { ArticleImage } from '@app/common/entity/article-image.model';
import { Article } from '@app/common/entity/article.model';
import { ArticleStatus } from '@app/common/entity/enums/articlestatus.enum';
import {
  getMockArticles,
  mockSequelize,
  mockUser,
} from '@app/common/helpers/test.helpers';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ContextIdFactory, Reflector } from '@nestjs/core';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { ARTICLE_REMOVED_MESSAGE } from './article.constants';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

const moduleMocker = new ModuleMocker(global);

let user: UserDto;

const articles: ArticleDto[] = getMockArticles();

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

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: ArticleService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
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
          provide: getModelToken(Article),
          useValue: mockSequelize,
        },
        {
          provide: getModelToken(ArticleImage),
          useValue: mockSequelize,
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
            remove: jest.fn(),
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

    controller = await moduleRef.resolve(ArticleController, contextId);
    service = await moduleRef.resolve(ArticleService, contextId);

    user = mockUser();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('CRUD operations', () => {
    it('should return an array of articles', async () => {
      const query = { page: 1, pageSize: 10 };
      jest.spyOn(service, 'findAll').mockResolvedValue(articles);
      expect(await controller.findAll(query)).toBe(articles);
    });

    it('should successfully create an article', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(article);
      expect(await controller.create(user.id, article)).toBe(article);
    });

    it('should return articles for the current user', async () => {
      const query = { page: 1, pageSize: 10, mine: true };
      jest.spyOn(service, 'findAll').mockResolvedValue(articles);
      expect(await controller.findAll(query, user.id)).toBe(articles);
    });

    it('should return article with status published', async () => {
      jest.spyOn(service, 'publish').mockResolvedValue(publishedArticle);
      expect(await controller.publish(article.id, user.id)).toBe(
        publishedArticle,
      );
    });

    it('should return the updated article', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(updatedArticle);
      expect(
        await controller.update(updatedArticle.id, updatedArticle, user.id),
      ).toBe(updatedArticle);
    });

    it('should return a message after removing an article', async () => {
      const result = { message: ARTICLE_REMOVED_MESSAGE(article.id), id: '' };
      jest.spyOn(service, 'remove').mockResolvedValue(result);
      expect(await controller.remove(article.id, user.id)).toBe(result);
    });
  });
});
