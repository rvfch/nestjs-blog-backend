import { IConfigBase } from '@app/common/interface/config.base.interface';

export interface IConfig extends IConfigBase {
  authUrl: string;
  tenantUrl: string;
  blogUrl: string;
  fileManagerUrl: string;
  usersUrl: string;
  gatewayUrl: string;
}
