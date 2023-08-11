import { Request } from 'express';

export interface RequestWithTenantId extends Request {
  tenantId?: string;
}
