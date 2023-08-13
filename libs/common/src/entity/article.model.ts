import { ObjectType } from '@nestjs/graphql';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  IsUUID,
  Table,
} from 'sequelize-typescript';
import { ArticleImage } from './article-image.model';
import { BaseModel } from './base.model';
import { Comment } from './comment.model';
import { ArticleStatus } from './enums/articlestatus.enum';
import { IArticle } from './interface/article.interface';
import { IComment } from './interface/comment.interface';
import { IImage } from './interface/image.interface';
import { User } from './user.model';

@ObjectType()
@Table({
  freezeTableName: true,
})
export class Article extends BaseModel<Article> implements IArticle {
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
  })
  title!: string;

  @Column({
    type: DataType.STRING,
  })
  perex: string;

  @Column({
    type: DataType.TEXT,
  })
  content: string;

  @Column({
    type: DataType.ENUM(ArticleStatus.PUBLISHED, ArticleStatus.DRAFT),
    allowNull: false,
    defaultValue: ArticleStatus.DRAFT,
  })
  status!: ArticleStatus;

  @HasMany(() => Comment, { onDelete: 'CASCADE' })
  comments?: IComment[];

  @HasOne(() => ArticleImage, {
    onDelete: 'CASCADE',
  })
  image?: IImage;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  author: string;
}
