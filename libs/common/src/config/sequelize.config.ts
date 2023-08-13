import { Injectable } from '@nestjs/common';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';
import { DEVELOPMENT, PRODUCTION } from '../constants/constants';
import { ArticleImage } from '../entity/article-image.model';
import { Article } from '../entity/article.model';
import { BlacklistedToken } from '../entity/blacklisted-token.model';
import { Comment } from '../entity/comment.model';
import { Credentials } from '../entity/credentials.model';
import { Rating } from '../entity/rating.model';
import { Tenant } from '../entity/tenant.model';
import { UserImage } from '../entity/user-image.model';
import { User } from '../entity/user.model';
import { databaseConfig } from './database.config';

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
      // Default models
      models: [
        Tenant,
        Article,
        Comment,
        Credentials,
        User,
        ArticleImage,
        UserImage,
        Rating,
        BlacklistedToken,
      ],
      //  autoLoadModels: true,
      synchronize: true,
    };
  }
}
