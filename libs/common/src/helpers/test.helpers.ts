import { ArticleDto } from '../dto/blog/article/article.dto';
import { UserDto } from '../dto/users/user.dto';
import { ArticleStatus } from '../entity/enums/articlestatus.enum';
import { RequestWithTenantId } from '../utils/express/request-with-tenant';
import { v4 as uuidv4 } from 'uuid';

export const generateRandomUUID4 = (): string => {
  return uuidv4();
};

export const mockSequelize = {
  findAll: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  update: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
  findOne: jest.fn(),
  schema: jest.fn(),
};

export const mockUser = (): UserDto => ({
  id: generateRandomUUID4(),
  email: 'test@test.com',
  name: 'Test user',
});

export const getMockArticles = (): ArticleDto[] => {
  return [
    {
      id: generateRandomUUID4(),
      title: 'Test',
      content: 'Test content',
      perex: 'test',
      createdAt: new Date('11-08-2023T00:00:00.000Z'),
      updatedAt: new Date('11-08-2023T00:00:00.000Z'),
      status: ArticleStatus.DRAFT,
      user: mockUser(),
    },
    {
      id: generateRandomUUID4(),
      title: 'Test',
      content: 'Test content',
      perex: 'test',
      createdAt: new Date('11-08-2023T00:00:00.000Z'),
      updatedAt: new Date('11-08-2023T00:00:00.000Z'),
      status: ArticleStatus.DRAFT,
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
