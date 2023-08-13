import {
  CREATE_USER,
  GET_USER_BY_CREDENTIALS,
  GET_USER_BY_EMAIL,
  GET_USER_BY_ID,
  VERIFY_TENANT,
} from '@app/common/constants/constants';
import {
  INVALID_CREDENTIALS,
  INVALID_TOKEN,
  TENANT_NOT_EXISTS,
} from '@app/common/constants/errors.constants';
import { TokenType } from '@app/common/constants/token-type.enum';
import { BaseService } from '@app/common/core/services/base.service';
import { JwtService } from '@app/common/core/services/jwt.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { AuthResultDto } from '@app/common/dto/auth/auth-result.dto';
import { LoginDto } from '@app/common/dto/auth/login.dto';
import { SignUpDto } from '@app/common/dto/auth/signup.dto';
import { TenantAuthorizedDto } from '@app/common/dto/auth/tenant-authorized.dto';
import { UserDto } from '@app/common/dto/users/user.dto';
import { MessageDto } from '@app/common/dto/utils/message.dto';
import { Credentials } from '@app/common/entity/credentials.model';
import { ICredentials } from '@app/common/entity/interface/credentials.interface';
import { ITenant } from '@app/common/entity/interface/tenant.interface';
import { IUser } from '@app/common/entity/interface/user.interface';
import { User } from '@app/common/entity/user.model';
import { isNull, isUndefined } from '@app/common/helpers/validation.helpers';
import { IRefreshToken } from '@app/common/interface/auth/token/refresh-token.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { verify } from 'argon2';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { Observable, firstValueFrom } from 'rxjs';
import { Sequelize } from 'sequelize-typescript';
import { LOGOUT_SUCCESSFUL, REGISTRATION_SUCCESSFUL } from './auth.constants';
import { AuthHelper } from './helpers/auth.helpers';

@Injectable({ scope: Scope.REQUEST })
export class AuthService extends BaseService {
  constructor(
    protected readonly sequelize: Sequelize,
    private readonly jwtService: JwtService,
    @Inject('REDIS') protected readonly client: ClientProxy,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    protected readonly tenantStateService: TenantStateService,
  ) {
    super(sequelize, tenantStateService, client);
  }

  /**
   * Generates authentication tokens for a user
   *
   * @param user: User
   * @param clientUri?: string
   * @param tokenId?: string
   * @returns Promise<[string, string]> - Array with access and refresh tokens
   */
  private async generateAuthTokens(
    user: IUser,
    clientUri?: string,
    tokenId?: string,
  ): Promise<[string, string]> {
    return Promise.all([
      this.jwtService.generateUserToken(
        user,
        TokenType.ACCESS,
        clientUri,
        tokenId,
      ),
      this.jwtService.generateUserToken(
        user,
        TokenType.REFRESH,
        clientUri,
        tokenId,
      ),
    ]);
  }

  /**
   * Handles the sign-up process
   *
   * @param dtoIn: SignUpDto
   * @param clientUri?: string
   * @returns Promise<IMessage> - Message indicating the success of the registration
   */
  public async signUp(
    dtoIn: SignUpDto,
    clientUri?: string,
  ): Promise<MessageDto> {
    const { name, email, password1, password2 } = dtoIn;

    // Ensure that the two passwords match.
    AuthHelper.comparePasswords(password1, password2);

    this.logger.debug(`Creating user ${name} with email ${email}`);
    await this.getData<[IUser, ICredentials]>(CREATE_USER, [
      {
        name,
        email,
        password: password1,
      },
    ]);

    this.logger.debug(`User ${name} created`);

    // Return a success message.
    return this.generateMessage(REGISTRATION_SUCCESSFUL);
  }

  /**
   * Handles the sign-in process
   *
   * @param dtoIn: LoginDto
   * @param clientUri?: string
   * @returns Promise<AuthResultDto> - Authentication result with tokens and user details
   */

  public async login(
    dtoIn: LoginDto,
    clientUri?: string,
  ): Promise<AuthResultDto> {
    const { email, password1 } = dtoIn;

    // Get the user by email
    const user = await this.getData<User>(GET_USER_BY_EMAIL, email);

    // Check the password
    if (!user) {
      throw new BadRequestException(INVALID_CREDENTIALS);
    }

    if (!(await verify(user.password, password1))) {
      await AuthHelper.checkLastPassword(user.credentials, password1);
    }

    // Generate tokens
    const [accessToken, refreshToken] = await this.generateAuthTokens(
      user,
      clientUri,
    );

    return { user: new UserDto(user), accessToken, refreshToken };
  }

  /**
   * Handles the logout process
   *
   * @param refreshToken: string
   * @returns Promise<IMessage> - Message indicating the success of the logout
   */
  public async logout(refreshToken: string): Promise<MessageDto> {
    // 1. Verify refresh token
    const { id, tokenId } =
      await this.jwtService.verifyUserToken<IRefreshToken>(
        refreshToken,
        TokenType.REFRESH,
      );
    // 1. 1. Throw error if token is invalid
    if (!id || !tokenId) {
      throw new BadRequestException(INVALID_TOKEN);
    }
    await this.createBlacklistedToken(id, tokenId, 3600); // blacklist the refresh token
    return this.generateMessage(LOGOUT_SUCCESSFUL); // return success message
  }

  /**
   * Retrieves a user by ID
   *
   * @param id: string
   * @returns Promise<IUser> - User object
   */
  public async getMe(id: string): Promise<UserDto> {
    return new UserDto(await this.getData<User>(GET_USER_BY_ID, id));
  }

  /**
   * Creates a token and adds it to the blacklist
   *
   * @param userId: string
   * @param tokenId: string
   * @param exp: number
   */
  private async createBlacklistedToken(
    userId: string,
    tokenId: string,
    exp: number,
  ): Promise<void> {
    const now = dayjs().unix();
    const ttl = (exp - now) * 1000;

    if (ttl > 0) {
      await this.throwInternalError(
        this.cacheManager.set(`blacklist:${userId}:${tokenId}`, now, ttl),
      );
    }
  }

  /**
   * Refreshes the access token
   *
   * @param refreshToken: string
   * @param domain?: string
   * @returns Promise<AuthResultDto> - Authentication result with refreshed tokens and user details
   */
  public async refreshTokenAccess(
    refreshToken: string,
    clientUri?: string,
  ): Promise<AuthResultDto> {
    const { id, version, tokenId } =
      await this.jwtService.verifyUserToken<IRefreshToken>(
        refreshToken,
        TokenType.REFRESH,
      );
    await this.checkIfTokenIsBlacklisted(id, tokenId);

    const [user, credentials] = await this.getData<[User, Credentials]>(
      GET_USER_BY_CREDENTIALS,
      {
        userId: id,
        version,
      },
    );
    user.credentials = credentials;

    const [accessToken, newRefreshToken] = await this.generateAuthTokens(
      user,
      clientUri,
      tokenId,
    );

    return {
      user: new UserDto(user),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Checks if a token is in the blacklist
   *
   * @param userId: string
   * @param tokenId: string
   * @throws UnauthorizedException - If the token is in the blacklist
   */
  private async checkIfTokenIsBlacklisted(
    userId: string,
    tokenId: string,
  ): Promise<void> {
    const time = await this.cacheManager.get<number>(
      `blacklist:${userId}:${tokenId}`,
    );

    if (!isUndefined(time) && !isNull(time)) {
      throw new UnauthorizedException(INVALID_TOKEN);
    }
  }

  /**
   * Initialize a tenant
   *
   * @param dtoIn: Observable<ITenant | { error: any }>
   *
   * @returns Promise<TenantAuthorizedDto> - Authorization result
   * @throws UnauthorizedException - If the provided credentials are invalid
   */
  public async initTenant(): Promise<TenantAuthorizedDto> {
    const tenant: ITenant = await this.getData<ITenant>(VERIFY_TENANT);
    if (tenant) {
      return { apiKey: tenant.id };
    } else {
      throw new ForbiddenException(TENANT_NOT_EXISTS);
    }
  }

  /**
   * Authorizes a tenant
   *
   * @param dtoIn: Observable<ITenant | { error: any }>
   * @param password: string
   * @returns Promise<TenantAuthorizedDto> - Authorization result
   * @throws UnauthorizedException - If the provided credentials are invalid
   */
  public async authorizeTenant(
    dtoIn: Observable<ITenant | { error: any }>,
    password: string,
  ): Promise<TenantAuthorizedDto> {
    const tenant: ITenant = (await firstValueFrom(dtoIn)) as ITenant;
    if (await verify(tenant.password, password)) {
      return { apiKey: tenant.id };
    } else {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
  }
}
