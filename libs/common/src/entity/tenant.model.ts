import { Column, DataType, Is, IsUUID, Table } from 'sequelize-typescript';
import { ITenant } from './interface/tenant.interface';
import { ARGON2_HASH } from '../constants/regex.constants';
import { BaseModel } from './base.model';
@Table({
  freezeTableName: true,
})
export class Tenant extends BaseModel<Tenant> implements ITenant {
  @IsUUID(4)
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Is(ARGON2_HASH)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;
}
