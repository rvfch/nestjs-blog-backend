import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext): string | undefined => {
    const gqlContext = GqlExecutionContext.create(context);
    const req = gqlContext.getContext().req;

    // If it's a subscription, the context is slightly different
    if (!req) {
      const client = context.switchToWs().getClient();
      return client && client.handshake && client.handshake.query.user;
    }

    // For standard GraphQL or RESTful requests
    return req && req.user;
  },
);
