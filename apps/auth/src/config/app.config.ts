import { configBase } from '@app/common/config/config.base';
import { IConfig } from './interface/config.interface';

export function config(): IConfig {
  return {
    ...configBase,
    cookieSecret: process.env.COOKIE_SECRET,
  };
}
