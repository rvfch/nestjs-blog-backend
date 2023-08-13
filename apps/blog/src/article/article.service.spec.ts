import { JwtService } from '@app/common/core/services/jwt.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { ArticleDto } from '@app/common/dto/blog/article/article.dto';
import { CreateArticleDto } from '@app/common/dto/blog/article/create-article.dto';
import { UserDto } from '@app/common/dto/users/user.dto';
import { ArticleImage } from '@app/common/entity/article-image.model';
import { Article } from '@app/common/entity/article.model';
import { BlacklistedToken } from '@app/common/entity/blacklisted-token.model';
import { Comment } from '@app/common/entity/comment.model';
import { Credentials } from '@app/common/entity/credentials.model';
import { ArticleStatus } from '@app/common/entity/enums/articlestatus.enum';
import { IImage } from '@app/common/entity/interface/image.interface';
import { Rating } from '@app/common/entity/rating.model';
import { Tenant } from '@app/common/entity/tenant.model';
import { UserImage } from '@app/common/entity/user-image.model';
import { User } from '@app/common/entity/user.model';
import {
  getMockArticles,
  mockSequelize,
  mockUser,
} from '@app/common/helpers/test.helpers';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ContextIdFactory, Reflector } from '@nestjs/core';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import { Sequelize } from 'sequelize-typescript';
import { ARTICLE_REMOVED_MESSAGE } from './article.constants';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  let service: ArticleService;
  let userModel: typeof User;
  let articleModel: typeof Article;
  let articleImageModel: typeof ArticleImage;
  let user: UserDto;
  const articles: ArticleDto[] = getMockArticles();
  const articleToCreate: CreateArticleDto = {
    title: 'Test',
    content: 'Test content',
    perex: 'test',
    imageUrl: undefined,
  };
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
    imageUrl: expect.any(String),
    id: expect.any(String),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        TenantStateService,
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
        {
          provide: getModelToken(Article),
          useValue: Article,
        },
        {
          provide: getModelToken(ArticleImage),
          useValue: ArticleImage,
        },
        {
          provide: getModelToken(User),
          useValue: User,
        },
        {
          provide: getModelToken(Comment),
          useValue: Comment,
        },
        {
          provide: getModelToken(BlacklistedToken),
          useValue: BlacklistedToken,
        },
        {
          provide: getModelToken(Tenant),
          useValue: Tenant,
        },
        {
          provide: getModelToken(UserImage),
          useValue: UserImage,
        },
        {
          provide: getModelToken(Credentials),
          useValue: Credentials,
        },
        {
          provide: getModelToken(Rating),
          useValue: Rating,
        },
        {
          provide: Sequelize,
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
    }).compile();

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    service = await moduleRef.resolve(ArticleService, contextId);
    userModel = moduleRef.get<typeof User>(getModelToken(User));
    articleModel = moduleRef.get<typeof Article>(getModelToken(Article));
    articleImageModel = moduleRef.get<typeof ArticleImage>(
      getModelToken(ArticleImage),
    );

    jest.spyOn(userModel, 'schema').mockReturnThis();
    jest.spyOn(articleModel, 'schema').mockReturnThis();
    jest.spyOn(articleImageModel, 'schema').mockReturnThis();

    user = mockUser();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('HDS should return all articles', async () => {
      jest
        .spyOn(articleModel, 'findAll')
        .mockResolvedValueOnce(articles as Article[]);
      const result = await service.findAll({ page: 1, pageSize: 10 });
      expect(result).toEqual(articles as ArticleDto[]);
    });
  });

  describe('findOne', () => {
    it('HDS should return a single article', async () => {
      jest
        .spyOn(articleModel, 'findOne')
        .mockResolvedValueOnce(article as Article);
      const result = await service.findOne(article.id);
      expect(result).toEqual(article);
    });
  });

  describe('create', () => {
    it('HDS should create a new article', async () => {
      articleModel.build = jest.fn().mockReturnValue(article);
      jest.spyOn(service as any, 'getUserById').mockResolvedValue(user as User);
      const result = await service.create(articleToCreate, user.id);
      expect(result).toEqual(article);
    });
  });

  describe('myArticles', () => {
    it('HDS should return articles for the current user', async () => {
      jest
        .spyOn(articleModel, 'findAll')
        .mockResolvedValue(articles as Article[]);
      const result = await service.findAll({ page: 1, pageSize: 10 }, user.id);
      expect(result).toEqual(articles);
    });
  });

  describe('update', () => {
    it('HDS should update and return an article', async () => {
      const mockImage: IImage = {
        url: 'http://test.com/img.png',
        id: expect.any(String),
      };
      const articleModelUpdated = {
        ...updatedArticle,
        image: mockImage,
      };
      jest
        .spyOn(articleModel, 'update')
        .mockResolvedValue([1, [articleModelUpdated]] as any);
      jest.spyOn(articleModel, 'findOne').mockResolvedValue(article as Article);
      jest
        .spyOn(articleImageModel, 'findOne')
        .mockResolvedValue(mockImage as ArticleImage);
      jest.spyOn(articleImageModel, 'update').mockResolvedValue([1]);
      const result = await service.update(updatedArticle, user.id);
      expect(result).toMatchObject(updatedArticle);
    });
  });

  describe('remove', () => {
    it('HDS should remove and return a message', async () => {
      jest.spyOn(articleModel, 'findOne').mockResolvedValue(article as Article);
      jest.spyOn(articleModel, 'destroy').mockResolvedValue(1);
      const result = await service.remove(article.id, user.id);
      expect(result).toEqual(ARTICLE_REMOVED_MESSAGE(article.id));
    });
  });

  describe('publish', () => {
    it('HDS should publish and return an article', async () => {
      const mockArticleInstance = {
        ...publishedArticle,
        update: jest.fn().mockResolvedValue([1]),
      };
      jest
        .spyOn(articleModel, 'findOne')
        .mockResolvedValue(mockArticleInstance as any);
      const result = await service.publish(publishedArticle.id, user.id);
      expect(result).toEqual(publishedArticle);
    });
  });
});
