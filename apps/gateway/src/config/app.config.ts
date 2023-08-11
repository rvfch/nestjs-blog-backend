import { configBase } from '@app/common/config/config.base';
import { IConfig } from './interface/config.interface';

export function config(): IConfig {
  return {
    ...configBase,
    authUrl: process.env.AUTH_SERVICE_URL,
    tenantUrl: process.env.TENANT_SERVICE_URL,
    blogUrl: process.env.BLOG_SERVICE_URL,
    fileManagerUrl: process.env.FILE_MANAGER_URL,
    usersUrl: process.env.USERS_SERVICE_URL,
    gatewayUrl: process.env.GATEWAY_URL,
  };
}
