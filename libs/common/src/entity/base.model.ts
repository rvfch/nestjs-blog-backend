import { Model } from 'sequelize-typescript';

export abstract class BaseModel<T> extends Model<T> {}
