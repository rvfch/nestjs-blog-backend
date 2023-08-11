import { TokenType } from '@app/common/constants/token-type.enum';
import { BaseService } from '@app/common/core/services/base.service';
import { IUser } from '@app/common/entity/interface/user.interface';
import { IJwt } from '@app/common/core/interface/jwt.interface';
import {
  IAccessPayload,
  IAccessToken,
} from '@app/common/interface/auth/token/access-token.interface';
import {
  IEmailPayload,
  IEmailToken,
} from '@app/common/interface/auth/token/email-token.interface';
import {
  IRefreshPayload,
  IRefreshToken,
} from '@app/common/interface/auth/token/refresh-token.interface';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize-typescript';
import { v4 } from 'uuid';
import { Algorithm } from 'jsonwebtoken';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';

@Injectable({ scope: Scope.REQUEST })
export class JwtService {
  private readonly jwtConfig: IJwt;
  private readonly issuer: string;
  private readonly clientUri: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtConfig = this.configService.get<IJwt>('jwt');
    this.issuer = 'AUTH';
    this.clientUri = this.configService.get<string>('clientUri');
  }

  /**
   * Generates a JWT for a user based on the provided TokenType
   *
   * @param user - The user for whom the token is generated
   * @param tokenType - The type of token to generate (access, refresh, confirmation, reset password)
   * @param clientUri - The client URI for which the token is generated (optional)
   * @param tokenId - The ID of the token (optional)
   * @returns A promise that resolves to the generated JWT
   * @throws Error - If an invalid TokenType is provided
   */
  public async generateUserToken(
    user: IUser,
    tokenType: TokenType,
    clientUri?: string | null,
    tokenId?: string,
  ): Promise<string> {
    switch (tokenType) {
      case TokenType.ACCESS:
        return this.generateAccessUserToken(user, clientUri);
      case TokenType.REFRESH:
        return this.generateRefreshUserToken(user, clientUri, tokenId);
      default:
        throw new Error(`Invalid TokenType: ${tokenType}`);
    }
  }

  /**
   * Generates options for signing a JWT
   *
   * @param user - The user for whom the token is generated
   * @param clientUri - The client URI for which the token is generated (optional)
   * @param expiresIn - The time after which the token expires (in seconds)
   * @param algorithm - The algorithm used to sign the JWT
   * @returns An object containing options for signing a JWT
   */
  private generateSignOptions(
    user: IUser,
    clientUri: string | null,
    expiresIn: number,
    algorithm: Algorithm,
  ): jwt.SignOptions {
    return {
      issuer: this.issuer,
      subject: user.id,
      audience: clientUri ?? this.clientUri,
      expiresIn: expiresIn,
      algorithm: algorithm,
    };
  }

  /**
   * Generates options for verifying a JWT
   *
   * @param tokenType - The type of token to verify (access, refresh, confirmation, reset password)
   * @returns An object containing options for verifying a JWT
   */
  private generateVerifyOptions(tokenType: TokenType): jwt.VerifyOptions {
    const { time } = this.jwtConfig[tokenType];
    return {
      issuer: this.issuer,
      audience: new RegExp(this.clientUri),
      maxAge: time,
      algorithms: tokenType === TokenType.ACCESS ? ['RS256'] : ['HS256'],
    };
  }

  /**
   * Generates Access Token for a user
   *
   * @param user: IUser - The user for whom access token is to be generated
   * @param clientUri: string - The client URI for which the token is generated
   * @return Promise<string> - Access Token
   */
  private async generateAccessUserToken(
    user: IUser,
    clientUri: string | null,
  ): Promise<string> {
    const { privateKey, time } = this.jwtConfig.access;
    const jwtOptions = {
      ...this.generateSignOptions(user, clientUri, time, 'RS256'),
    };
    return this.throwInternalError(
      JwtService.generateTokenAsync({ id: user.id }, privateKey, jwtOptions),
    );
  }

  /**
   * Generates Refresh Token for a user
   *
   * @param user: IUser - The user for whom refresh token is to be generated
   * @param clientUri: string - The client URI for which the token is generated
   * @param tokenId?: string - The ID of the token
   * @return Promise<string> - Refresh Token
   */
  private async generateRefreshUserToken(
    user: IUser,
    clientUri: string | null,
    tokenId?: string,
  ): Promise<string> {
    const { secret: refreshSecret, time } = this.jwtConfig.refresh;
    const jwtOptions = {
      ...this.generateSignOptions(user, clientUri, time, 'HS256'),
    };
    return this.throwInternalError(
      JwtService.generateTokenAsync(
        {
          id: user.id,
          version: user.credentials.version,
          tokenId: tokenId ?? v4(),
        },
        refreshSecret,
        jwtOptions,
      ),
    );
  }

  /**
   * Generates a token asynchronously
   *
   * @param payload: IAccessPayload | IEmailPayload | IRefreshPayload - The payload for the JWT
   * @param secret: string - The secret used to sign the JWT
   * @param options: jwt.SignOptions - Options for signing the JWT
   * @return Promise<string> - A JWT
   */
  private static async generateTokenAsync(
    payload: IAccessPayload | IEmailPayload | IRefreshPayload,
    secret: string,
    options: jwt.SignOptions,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options, (e, token) => {
        if (e) {
          reject(e);
          return;
        }
        resolve(token);
      });
    });
  }

  /**
   * Verifies a JWT
   *
   * @param token - The JWT to verify
   * @param tokenType - The type of token to verify (access, refresh, confirmation, reset password)
   * @returns A promise that resolves to the payload of the verified JWT
   * @throws Error - If an invalid TokenType is provided
   */
  public async verifyUserToken<
    T extends IAccessToken | IRefreshToken | IEmailToken,
  >(token: string, tokenType: TokenType): Promise<T> {
    const jwtOptions = this.generateVerifyOptions(tokenType);

    switch (tokenType) {
      case TokenType.ACCESS:
        const { publicKey } = this.jwtConfig.access;
        return this.throwBadRequest(
          JwtService.verifyTokenAsync(token, publicKey, jwtOptions),
        );
      case TokenType.REFRESH:
        const { secret } = this.jwtConfig[tokenType];
        return this.throwBadRequest(
          JwtService.verifyTokenAsync(token, secret, jwtOptions),
        );
      default:
        throw new Error(`Invalid TokenType: ${tokenType}`);
    }
  }

  /**
   * Verifies a token asynchronously
   *
   * @param token: string - The JWT to verify
   * @param secret: string - The secret used to sign the JWT
   * @param options: jwt.VerifyOptions - Options for verifying the JWT
   * @return Promise<T> - The payload of the verified JWT
   */
  private static async verifyTokenAsync<T>(
    token: string,
    secret: string,
    options: jwt.VerifyOptions,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, (e, payload: T) => {
        if (e) {
          reject(e);
          return;
        }
        resolve(payload);
      });
    });
  }

  /**
   * This function throwing 500 error
   *
   * @param promise: Promise<T>
   * @return Promise<T>
   * @throw 500
   */
  public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  public async throwBadRequest<
    T extends IAccessToken | IRefreshToken | IEmailToken,
  >(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('Invalid token');
      }
      throw new InternalServerErrorException(error);
    }
  }
}
