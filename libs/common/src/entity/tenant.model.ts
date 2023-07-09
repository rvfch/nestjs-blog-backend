import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table({ schema: 'public' })
export class Tenant extends Model<Tenant> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  // @ForeignKey(() => User)
  // @Column({
  //   type: DataType.STRING,
  //   allowNull: false,
  // })
  // userId: string;

  // @BelongsTo(() => User)
  // user: string;
}
