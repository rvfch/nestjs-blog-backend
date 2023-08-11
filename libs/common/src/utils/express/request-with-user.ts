import { RequestWithTenantId } from './request-with-tenant';

export interface RequestWithUser extends RequestWithTenantId {
  user?: string;
}
