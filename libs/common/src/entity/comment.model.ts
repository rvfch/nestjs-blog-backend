import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Article } from './article.model';
import { User } from './user.model';
import { Rating } from './rating.model';

@Table
export class Comment extends Model<Comment> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @BelongsTo(() => Article)
  article: Article;

  @ForeignKey(() => Article)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  articleId: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => Comment)
  parent: Comment;

  @ForeignKey(() => Comment)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  parentId: string;

  @HasMany(() => Comment)
  children: Comment[];

  @Column({
    type: DataType.TEXT,
  })
  text: string;

  @HasMany(() => Rating)
  rating: Rating[];
}
