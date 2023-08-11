import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Comment } from './comment.model';
import { IRating } from './interface/rating.interface';
import { IUser } from './interface/user.interface';
import { IComment } from './interface/comment.interface';
import { BaseModel } from './base.model';
import { ObjectType } from '@nestjs/graphql';

@Table({
  freezeTableName: true,
})
export class Rating extends BaseModel<Rating> implements IRating {
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isUpvote!: boolean;

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
  comment!: IComment;

  @IsUUID(4)
  @ForeignKey(() => Comment)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  commentId!: string;
}
