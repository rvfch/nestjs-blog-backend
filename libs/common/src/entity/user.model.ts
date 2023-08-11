import {
  Column,
  DataType,
  HasMany,
  HasOne,
  Is,
  IsEmail,
  IsIPv4,
  IsUUID,
  Max,
  Min,
  Table,
} from 'sequelize-typescript';
import { IUser } from './interface/user.interface';
import { ARGON2_HASH } from '../constants/regex.constants';
import { ICredentials } from './interface/credentials.interface';
import { Credentials } from './credentials.model';
import { BaseModel } from './base.model';
import { IBlacklistedToken } from './interface/blacklisted-token.interface';
import { BlacklistedToken } from './blacklisted-token.model';
import { UserImage } from './user-image.model';
import { IImage } from './interface/image.interface';
import { Article } from './article.model';
import { IArticle } from './interface/article.interface';

@Table({
  freezeTableName: true,
})
export class User extends BaseModel<User> implements IUser {
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @IsEmail
  @Min(5)
  @Max(255)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Is(ARGON2_HASH)
  @Column({
    type: DataType.STRING,
  })
  password!: string;

  //@Is(NAME_REGEX)
  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isAdmin: boolean;

  @IsIPv4
  @Column({
    type: DataType.STRING,
  })
  ip: string;

  @HasOne(() => Credentials, { onDelete: 'CASCADE' })
  credentials: ICredentials;

  @HasMany(() => BlacklistedToken, { onDelete: 'CASCADE' })
  blacklistedTokens: IBlacklistedToken[];

  @HasOne(() => UserImage, { onDelete: 'CASCADE' })
  avatar?: IImage;

  @HasMany(() => Article, { onDelete: 'CASCADE' })
  articles: IArticle[];
}
