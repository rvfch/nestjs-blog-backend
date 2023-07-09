import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Comment } from './comment.model';

@Table
export class Rating extends Model<Rating> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.SMALLINT,
    validate: {
      isIn: [[1, -1]],
    },
  })
  value: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => Comment)
  comment: Comment;

  @ForeignKey(() => Comment)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  comentId: string;
}
