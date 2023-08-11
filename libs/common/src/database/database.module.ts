import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ConfigModule } from '@nestjs/config';
import { SequelizeConfig } from '../config/sequelize.config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useClass: SequelizeConfig,
    }),
  ],
  providers: [SequelizeConfig],
  exports: [SequelizeConfig],
})
export class DatabaseModule {}
