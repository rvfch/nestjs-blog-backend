import { IConfigBase } from '@app/common/interface/config.base.interface';
import { IJwt } from '@app/common/core/interface/jwt.interface';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export interface IConfig extends IConfigBase {
  jwt: IJwt;
  throttler: ThrottlerModuleOptions;
  cookieSecret: string;
}
