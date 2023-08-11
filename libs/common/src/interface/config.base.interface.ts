import { RedisOptions } from 'ioredis';

export interface IRedisOptions extends RedisOptions {
  url?: string;
  host?: string;
  port?: number;
}

export interface IConfigBase {
  appName: string;
  port: number;
  clientUri: string;
  redis: IRedisOptions;
}
