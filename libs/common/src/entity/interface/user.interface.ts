import { ICredentials } from './credentials.interface';

export interface IUser {
  id?: string;
  email: string;
  name: string;
  password?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  ip?: string;
  credentials?: ICredentials;
  createdAt?: Date;
  updatedAt?: Date;
}
