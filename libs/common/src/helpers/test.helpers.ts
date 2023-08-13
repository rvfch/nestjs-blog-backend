import { v4 as uuidv4 } from 'uuid';
import { ArticleDto } from '../dto/blog/article/article.dto';
import { UserDto } from '../dto/users/user.dto';
import { ArticleStatus } from '../entity/enums/articlestatus.enum';
import { RequestWithTenantId } from '../utils/express/request-with-tenant';

export const generateRandomUUID4 = (): string => {
  return uuidv4();
};

export const mockSequelize = {
  transaction: jest.fn().mockImplementation(() => ({
    commit: jest.fn().mockImplementation(() => true),
    rollback: jest.fn().mockImplementation(() => true),
  })),
  literal: jest.fn(),
};

export const mockUser = (): UserDto => ({
  id: expect.any(String),
  email: 'test@test.com',
  name: 'Test user',
  isAdmin: false,
  isActive: false,
  createdAt: new Date('11-08-2023T00:00:00.000Z'),
  updatedAt: new Date('11-08-2023T00:00:00.000Z'),
});

export const getMockArticles = (): ArticleDto[] => {
  return [
    {
      id: expect.any(String),
      title: 'Test',
      content: 'Test content',
      perex: 'test',
      createdAt: new Date('11-08-2023T00:00:00.000Z'),
      updatedAt: new Date('11-08-2023T00:00:00.000Z'),
      status: ArticleStatus.DRAFT,
      imageUrl: undefined,
      commentsCount: 0,
      user: mockUser(),
    },
    {
      id: expect.any(String),
      title: 'Test 2',
      content: 'Test content 2',
      perex: 'test 2',
      createdAt: new Date('11-08-2023T00:00:00.000Z'),
      updatedAt: new Date('11-08-2023T00:00:00.000Z'),
      status: ArticleStatus.DRAFT,
      imageUrl: undefined,
      commentsCount: 0,
      user: mockUser(),
    },
  ];
};

export const mockRequestWithTenantId = (): RequestWithTenantId => {
  return {
    method: 'GET',
    tenantId: 'test-tenant-id',
    headers: {},
    params: {},
    query: {},
    body: {},
    get: jest.fn(() => undefined),
  } as unknown as RequestWithTenantId;
};
