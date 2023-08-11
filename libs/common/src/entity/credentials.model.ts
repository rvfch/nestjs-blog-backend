import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Is,
  IsUUID,
  Table,
} from 'sequelize-typescript';
import { ICredentials } from './interface/credentials.interface';
import { ARGON2_HASH } from '../constants/regex.constants';
import dayjs from 'dayjs';
import { User } from './user.model';
import { BaseModel } from './base.model';

@Table({
  freezeTableName: true,
})
export class Credentials
  extends BaseModel<Credentials>
  implements ICredentials
{
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  version: number;

  @Is(ARGON2_HASH)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastPassword: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: dayjs().unix(),
  })
  passwordUpdatedAt: number;

  @BelongsTo(() => User)
  user: User;

  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  public updatePassword(password: string): void {
    this.version++;
    this.lastPassword = password;
    const now = dayjs().unix();
    this.passwordUpdatedAt = now;
    this.updatedAt = now;
  }

  public updateVersion(): void {
    this.version++;
    this.updatedAt = dayjs().unix();
  }
}
