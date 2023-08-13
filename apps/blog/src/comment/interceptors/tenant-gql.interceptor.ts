import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommentService } from '../comment.service';

@Injectable()
export class TenantGqlInterceptor implements NestInterceptor {
  constructor(private readonly commentService: CommentService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const tenantId = req.headers
      ? req.headers['x-api-key']
      : req.connectionParams
      ? req.connectionParams['x-api-key']
      : null;

    if (!tenantId) {
      throw new Error('No tenant id provided.');
    }

    return from(this.commentService.handleTenantId(tenantId)).pipe(
      switchMap(() => next.handle()),
    );
  }
}
