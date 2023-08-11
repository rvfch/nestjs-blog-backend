import { configBase } from '@app/common/config/config.base';
import { IConfigBase } from '@app/common/interface/config.base.interface';

export function config(): IConfigBase {
  return {
    ...configBase,
  };
}
