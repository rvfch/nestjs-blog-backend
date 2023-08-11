import { IUser } from '@app/common/entity/interface/user.interface';

export interface IBlacklistedToken {
  tokenId: string;
  user: IUser;
}
