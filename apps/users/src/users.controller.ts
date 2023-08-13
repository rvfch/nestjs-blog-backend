import { BaseController } from '@app/common/core/controllers/base.controller';
import { TenantInterceptor } from '@app/common/core/interceptors/tenant.interceptor';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { BlacklistedTokenDto } from '@app/common/dto/users/blacklisted-token.dto';
import { CredentialsDto } from '@app/common/dto/users/credentials.dto';
import { UserDto } from '@app/common/dto/users/user.dto';
import { BlacklistedToken } from '@app/common/entity/blacklisted-token.model';
import { Credentials } from '@app/common/entity/credentials.model';
import { User } from '@app/common/entity/user.model';
import { Controller, UseInterceptors } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RedisContext,
} from '@nestjs/microservices';
import { BlacklistedTokenService } from './blacklisted-token/blacklisted-token.service';
import { UsersService } from './users.service';

@UseInterceptors(TenantInterceptor)
@Controller('users')
export class UsersController extends BaseController {
  constructor(
    private readonly usersService: UsersService,
    private readonly blacklistedTokenService: BlacklistedTokenService,
    private readonly tenantStateService: TenantStateService,
  ) {
    super(usersService);
  }

  /**
   * Creates a new user and returns the created user along with its credentials.
   *
   * @param {SignUpDto} payload - The payload containing the user's details.
   * @returns {Promise<[User, Credentials]>} - The created user and its credentials.
   */
  @MessagePattern('create_user')
  public async create(
    @Payload() payload: [UserDto, any],
    @Ctx() ctx: RedisContext,
  ): Promise<[User, Credentials]> {
    const dtoIn = this.extractFirstObjectFromPayload<UserDto>(payload);
    return await this.usersService.create(dtoIn);
  }

  /**
   * Verifies if a token is blacklisted.
   *
   * @param {BlacklistedTokenDto} payload - The payload containing the token details.
   * @returns {Promise<boolean>} - Returns true if token is blacklisted, else false.
   */
  @MessagePattern('verify_blacklisted_token')
  public async verifyBlacklistedToken(
    @Payload() payload: [BlacklistedTokenDto, any],
    @Ctx() ctx: RedisContext,
  ): Promise<boolean> {
    const dtoIn =
      this.extractFirstObjectFromPayload<BlacklistedTokenDto>(payload);
    return await this.blacklistedTokenService.verifyBlacklistedToken(dtoIn);
  }

  /**
   * Retrieves a user by their email.
   *
   * @param {string} payload - The payload containing the user's email.
   * @returns {Promise<User>} - The retrieved user.
   */
  @MessagePattern('get_user_by_email')
  public async getByEmail(
    @Payload() payload: [string, any],
    @Ctx() ctx: RedisContext,
  ): Promise<User> {
    const email = this.extractFirstObjectFromPayload<string>(payload);
    return await this.usersService.findOneByEmail(email, true);
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param {string} payload - The payload containing the user's ID.
   * @returns {Promise<User>} - The retrieved user.
   */
  @MessagePattern('get_user_by_id')
  public async getById(
    @Payload() payload: [string, any],
    @Ctx() ctx: RedisContext,
  ): Promise<User> {
    const id = this.extractFirstObjectFromPayload<string>(payload);
    return await this.usersService.findOneById(id);
  }

  /**
   * Retrieves a user by their email without checking if the user exists.
   *
   * @param {string} payload - The payload containing the user's email.
   * @returns {Promise<User>} - The retrieved user.
   */
  @MessagePattern('get_user_by_email_unchecked')
  public async getByEmailUnchecked(
    @Payload() payload: [string, any],
    @Ctx() ctx: RedisContext,
  ): Promise<User> {
    const email = this.extractFirstObjectFromPayload<string>(payload);
    return await this.usersService.findOneByEmail(email, true, false);
  }

  /**
   * Creates a new blacklisted token and returns it.
   *
   * @param {BlacklistedTokenDto} payload - The payload containing the token details.
   * @returns {Promise<BlacklistedToken>} - The created blacklisted token.
   */
  @MessagePattern('create_blacklisted_token')
  public async createBlacklistedToken(
    @Payload() payload: [BlacklistedTokenDto, any],
    @Ctx() ctx: RedisContext,
  ): Promise<BlacklistedToken> {
    const dtoIn =
      this.extractFirstObjectFromPayload<BlacklistedTokenDto>(payload);
    return await this.blacklistedTokenService.create(dtoIn);
  }

  /**
   * Retrieves a user by their credentials.
   *
   * @param {ICredentials} payload - The payload containing the user's credentials.
   * @returns {Promise<UserDto>} - The retrieved user.
   */
  @MessagePattern('get_user_by_credentials')
  public async getByCredentials(
    @Payload() payload: [CredentialsDto, any],
    @Ctx() ctx: RedisContext,
  ): Promise<[User, Credentials]> {
    const credentials =
      this.extractFirstObjectFromPayload<CredentialsDto>(payload);
    return await this.usersService.findOneByCredentials(
      credentials.userId,
      credentials.version,
    );
  }
}
