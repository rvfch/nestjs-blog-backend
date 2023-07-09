import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Article } from './article.model';

@Table
export class Image extends Model<Image> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  url: string;

  @BelongsTo(() => Article)
  article: Article;

  @ForeignKey(() => Article)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  articleId: string;
}
