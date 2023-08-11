import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TenantStateService } from '../services/tenant-state.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantStateService: TenantStateService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const payload = context.getArgByIndex(0);
    const tenantId = payload[1];

    if (!tenantId) {
      throw new RpcException('No tenant id provided.');
    }

    return from(this.tenantStateService.handleTenantId(tenantId)).pipe(
      switchMap(() => next.handle()),
    );
  }
}
