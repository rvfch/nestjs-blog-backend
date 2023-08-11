import { IToken } from './token.interface';

export interface IAccessPayload {
  id: string;
}

export interface IAccessToken extends IAccessPayload, IToken {}
