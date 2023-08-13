import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  IsUrl,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { IImage } from './interface/image.interface';
import { IUser } from './interface/user.interface';
import { User } from './user.model';

@Table({
  freezeTableName: true,
})
export class UserImage extends BaseModel<UserImage> implements IImage {
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @IsUrl
  @Column({
    type: DataType.STRING,
  })
  url!: string;

  @BelongsTo(() => User)
  user!: IUser;

  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId!: string;
}
