import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Tenant } from './tenant.model';
import { ArticleStatus } from './enums/articlestatus.enum';
import { Comment } from './comment.model';
import { Image } from './image.model';

@Table
export class Article extends Model<Article> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @ForeignKey(() => Tenant)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  blogId: string;

  @Column({
    type: DataType.STRING,
  })
  title: string;

  @Column({
    type: DataType.STRING,
  })
  perex: string;

  @Column({
    type: DataType.TEXT,
  })
  content: string;

  @Column({
    type: DataType.ENUM(ArticleStatus.PUBLUSHED, ArticleStatus.DRAFT),
    allowNull: false,
  })
  status: ArticleStatus;

  @HasMany(() => Comment, 'articleId')
  comments: Comment[];

  @HasOne(() => Image)
  image: Image;
}
