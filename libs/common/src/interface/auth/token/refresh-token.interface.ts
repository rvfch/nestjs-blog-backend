import { IEmailPayload } from './email-token.interface';
import { IToken } from './token.interface';

export interface IRefreshPayload extends IEmailPayload {
  tokenId: string;
}

export interface IRefreshToken extends IRefreshPayload, IToken {}
