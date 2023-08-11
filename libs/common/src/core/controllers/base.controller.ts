import { BaseService } from '../services/base.service';
import { Get } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';

export abstract class BaseController {
  constructor(protected readonly service: BaseService) {}

  public getTenantId(): string {
    return this.service.getTenantId();
  }

  public extractFirstObjectFromPayload<T>(payload: [T | T[], any]): T {
    return Array.isArray(payload[0]) ? payload[0][0] : payload[0];
  }
}
