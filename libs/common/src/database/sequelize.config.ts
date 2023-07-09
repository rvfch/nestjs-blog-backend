import { Injectable } from '@nestjs/common';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';
import { DEVELOPMENT, PRODUCTION } from '../constants/constants';
import { databaseConfig } from './database.config';
import { Tenant } from '../entity/tenant.model';
import { User } from '../entity/user.model';

@Injectable()
export class SequelizeConfig implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    let config;
    switch (process.env.NODE_ENV) {
      case DEVELOPMENT:
        config = databaseConfig.development;
        break;
      case PRODUCTION:
        config = databaseConfig.production;
        break;
      default:
        config = databaseConfig.development;
        break;
    }
    return {
      ...config,
      models: [Tenant, User],
      synchronize: true,
      autoLoadModels: true,
    };
  }
}
