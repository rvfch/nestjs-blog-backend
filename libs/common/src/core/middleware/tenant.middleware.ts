import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { RequestWithTenantId } from '../../utils/express/request-with-tenant';
import { TenantStateService } from '../services/tenant-state.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantStateService: TenantStateService) {}

  async use(req: RequestWithTenantId, res: Response, next: NextFunction) {
    // Assuming the tenantId is being sent as a header
    const tenantId = req.headers['x-api-key'] as string;

    if (tenantId) {
      // Set the tenantId in the TenantStateService
      await this.tenantStateService.handleTenantId(tenantId);
    } else {
      throw new BadRequestException('X-API-KEY is not specified!');
    }

    next();
  }
}
