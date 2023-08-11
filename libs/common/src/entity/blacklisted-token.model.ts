import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Table,
} from 'sequelize-typescript';
import { IBlacklistedToken } from './interface/blacklisted-token.interface';
import { User } from './user.model';
import { BaseModel } from './base.model';

@Table
export class BlacklistedToken
  extends BaseModel<BlacklistedToken>
  implements IBlacklistedToken
{
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  tokenId!: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;
}
