import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Table,
} from 'sequelize-typescript';
import { Article } from './article.model';
import { BaseModel } from './base.model';
import { IArticle } from './interface/article.interface';
import { IImage } from './interface/image.interface';

@Table({
  freezeTableName: true,
})
export class ArticleImage extends BaseModel<ArticleImage> implements IImage {
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  url!: string;

  @BelongsTo(() => Article)
  article!: IArticle;

  @IsUUID(4)
  @ForeignKey(() => Article)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  articleId!: string;
}
