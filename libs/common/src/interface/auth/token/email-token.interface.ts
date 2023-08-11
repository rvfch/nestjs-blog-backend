import { IAccessPayload } from './access-token.interface';
import { IToken } from './token.interface';

export interface IEmailPayload extends IAccessPayload {
  version: number;
}

export interface IEmailToken extends IEmailPayload, IToken {}
