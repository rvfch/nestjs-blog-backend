import { FindOptions } from 'sequelize';
import { BeforeFind, Model, Scopes } from 'sequelize-typescript';

export abstract class BaseModel<T> extends Model<T> {}
