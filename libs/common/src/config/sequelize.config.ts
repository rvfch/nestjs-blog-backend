import { Injectable } from '@nestjs/common';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';
import { DEVELOPMENT, PRODUCTION } from '../constants/constants';
import { databaseConfig } from './database.config';
import { Tenant } from '../entity/tenant.model';
import { Article } from '../entity/article.model';
import { Credentials } from '../entity/credentials.model';
import { User } from '../entity/user.model';
import { Rating } from '../entity/rating.model';
import { Comment } from '../entity/comment.model';
import { ArticleImage } from '../entity/article-image.model';
import { UserImage } from '../entity/user-image.model';
import { BlacklistedToken } from '../entity/blacklisted-token.model';

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
