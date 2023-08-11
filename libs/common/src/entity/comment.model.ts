import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  IsUUID,
  Table,
} from 'sequelize-typescript';
import { Article } from './article.model';
import { User } from './user.model';
import { Rating } from './rating.model';
import { IComment } from './interface/comment.interface';
import { IArticle } from './interface/article.interface';
import { IUser } from './interface/user.interface';
import { IRating } from './interface/rating.interface';
import { BaseModel } from './base.model';

@Table({
  freezeTableName: true,
})
export class Comment extends BaseModel<Comment> implements IComment {
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @BelongsTo(() => Article)
  article!: IArticle;

  @IsUUID(4)
  @ForeignKey(() => Article)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  articleId!: string;

  @BelongsTo(() => User)
  user!: IUser;

  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId!: string;

  @BelongsTo(() => Comment)
  parent?: IComment;

  @IsUUID(4)
  @ForeignKey(() => Comment)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  parentId?: string;

  @HasMany(() => Comment, { onDelete: 'CASCADE' })
  children?: IComment[];

  @Column({
    type: DataType.TEXT,
  })
  text!: string;

  @HasMany(() => Rating, { onDelete: 'CASCADE' })
  rating: IRating[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  ratingScore: number;
}
