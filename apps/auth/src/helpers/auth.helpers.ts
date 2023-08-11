import { ICredentials } from '@app/common/entity/interface/credentials.interface';
import { isUndefined } from '@app/common/helpers/validation.helpers';
import { RequestWithUser } from '@app/common/utils/express/request-with-user';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { verify } from 'argon2';
import dayjs from 'dayjs';
import { Response } from 'express';

export class AuthHelper {
  public static async checkLastPassword(
    credentials: ICredentials,
    password: string,
  ): Promise<void> {
    const { lastPassword, passwordUpdatedAt } = credentials;

    if (lastPassword.length === 0 || !(await verify(lastPassword, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = dayjs();
    const time = dayjs.unix(passwordUpdatedAt);
    const months = now.diff(time, 'month');
    const message = 'You changed your password ';

    if (months > 0) {
      throw new UnauthorizedException(
        message + months + (months > 1 ? ' months ago' : ' month ago'),
      );
    }

    const days = now.diff(time, 'day');

    if (days > 0) {
      throw new UnauthorizedException(
        message + days + (days > 1 ? ' days ago' : ' day ago'),
      );
    }

    const hours = now.diff(time, 'hour');

    if (hours > 0) {
      throw new UnauthorizedException(
        message + hours + (hours > 1 ? ' hours ago' : ' hour ago'),
      );
    }

    throw new UnauthorizedException(message + 'recently');
  }

  public static comparePasswords(password1: string, password2: string): void {
    if (password1 !== password2) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  public static refreshTokenFromReq(
    req: RequestWithUser,
    cookieName: string,
  ): string {
    const token: string | undefined = req.signedCookies[cookieName];

    if (isUndefined(token)) {
      throw new UnauthorizedException();
    }

    return token;
  }

  public static saveRefreshCookie(
    res: Response,
    refreshToken: string,
    cookieName: string,
    cookiePath: string,
    refreshTime: number,
    debug = true,
  ): Response {
    return res.cookie(cookieName, refreshToken, {
      secure: !debug,
      httpOnly: true,
      signed: true,
      path: cookiePath,
      expires: new Date(Date.now() + refreshTime * 1000),
    });
  }
}
