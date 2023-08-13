import { IAccessToken } from '@app/common/interface/auth/token/access-token.interface';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { isJWT } from 'class-validator';
import { Request } from 'express';
import { TokenType } from '../../constants/token-type.enum';
import { isNull, isUndefined } from '../../helpers/validation.helpers';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService } from '../services/jwt.service';

@Injectable()
export class AuthGqlGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const activate = await this.setHttpHeader(req, isPublic);

    if (!activate) {
      throw new UnauthorizedException();
    }

    return activate;
  }

  private async setHttpHeader(
    req: Request | any,
    isPublic: boolean,
  ): Promise<boolean> {
    const auth =
      req.headers?.authorization ?? req.connectionParams?.authorization;

    if (isUndefined(auth) || isNull(auth) || auth.length === 0) {
      return isPublic;
    }

    const authArr = auth.split(' ');
    const bearer = authArr[0];
    const token = authArr[1];

    if (isUndefined(bearer) || isNull(bearer) || bearer !== 'Bearer') {
      return isPublic;
    }

    if (isUndefined(token) || isNull(token) || !isJWT(token)) {
      return isPublic;
    }

    try {
      this.jwtService = new JwtService(this.configService);
      const { id } = await this.jwtService.verifyUserToken<IAccessToken>(
        token,
        TokenType.ACCESS,
      );

      req.user = id;

      return true;
    } catch (_) {
      return isPublic;
    }
  }
}
