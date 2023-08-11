import {
  EMAIL_ALREADY_IN_USE,
  INVALID_CREDENTIALS,
} from '@app/common/constants/errors.constants';
import { BaseService } from '@app/common/core/services/base.service';
import { User } from '@app/common/entity/user.model';
import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { isNull, isUndefined } from '@app/common/helpers/validation.helpers';
import { hash } from './helpers/hash.helpers';
import { formatName } from '@app/common/helpers/string.helpers';
import { UserDto } from '@app/common/dto/users/user.dto';
import { Credentials } from '@app/common/entity/credentials.model';
import dayjs from 'dayjs';
import { RpcException } from '@nestjs/microservices';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { UpdateUserDto } from '@app/common/dto/users/update-user.dto';

@Injectable({ scope: Scope.REQUEST })
export class UsersService extends BaseService {
  constructor(
    protected readonly sequelize: Sequelize,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Credentials) private credentialsRepository: typeof Credentials,
    protected readonly tenantStateService: TenantStateService,
  ) {
    super(sequelize, tenantStateService);
  }

  /**
   * Find a user by their ID.
   *
   * @param {string} id - User ID
   * @returns {Promise<User>} User
   * @throws {Error} If user does not exist
   */
  public async findOneById(id: string): Promise<User> {
    // 1. Find user by ID
    const user = await this.userRepository
      .schema(this.getTenantId())
      .findOne({ where: { id } });

    // 2. Checks if entity exists
    this.isEntityExists(user, 'User');

    return user;
  }

  /**
   * Find a user by their email.
   *
   * @param {string} email - User's email
   * @param {boolean} credentials - If true, includes user credentials
   * @param {boolean} check - If true, throws an error if user does not exist
   * @returns {Promise<User>} User
   * @throws {Error} If user does not exist and check is true
   */
  public async findOneByEmail(
    email: string,
    credentials = false,
    check = true,
  ): Promise<User> {
    // 1. Find user by Email
    const user = await this.userRepository.schema(this.getTenantId()).findOne({
      where: { email },
      include: [credentials && Credentials.schema(this.getTenantId())],
    });

    if (check) {
      this.throwUnauthorizedException(user);
    }

    return user;
  }

  /**
   * Find a user by their credentials.
   *
   * @param {string} userId - User ID
   * @param {number} version - Version of user's credentials
   * @returns {Promise<User>} User
   * @throws {Error} If user does not exist or versions mismatch
   */
  public async findOneByCredentials(
    userId: string,
    version: number,
  ): Promise<[User, Credentials]> {
    // 1. Find user by ID
    const user = await this.userRepository
      .schema(this.getTenantId())
      .findOne({ where: { id: userId } });
    const credentials = await this.credentialsRepository
      .schema(this.getTenantId())
      .findOne({ where: { userId } });
    // 2. Throw INVALID_CREDENTIALS
    this.throwUnauthorizedException(user);
    // 3. Throw error, if versions mismatch
    if (credentials.version !== version) {
      throw new RpcException(INVALID_CREDENTIALS);
    }

    return [user, credentials];
  }

  /**
   * Create a new user.
   *
   * @param {SignUpDtoIn} dtoIn - User data transfer object
   * @returns {Promise<[User, Credentials]>} User and credentials
   * @throws {Error} If email is not unique
   */
  public async create(dtoIn: UserDto): Promise<[User, Credentials]> {
    const { email, name, password } = dtoIn;
    // 1. Validate user email existence
    await this.isEmailUnique(email);
    // 2. Create user entity
    const hashedPassword = await hash(password);
    const user = this.userRepository.schema(this.getTenantId()).build({
      email,
      name,
      password: hashedPassword,
    });
    // 2.1. Create user's credentials record
    const credentials = this.credentialsRepository
      .schema(this.getTenantId())
      .build({
        userId: user.id,
        lastPassword: hashedPassword,
        version: 0,
        passwordUpdatedAt: dayjs().unix(),
      });
    // 3. Validate and save entities
    await this.saveEntity(user, true);
    await this.saveEntity(credentials, true);
    user.credentials = credentials;

    return [user, credentials];
  }

  /**
   * Update a user.
   *
   * @param {UpdateUserDtoIn} dtoIn - User data transfer object
   * @returns {Promise<User>} Updated user
   * @throws {Error} If user does not exist or new name is the same as old name
   */
  public async update(dtoIn: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(dtoIn.id);
    const { name } = dtoIn;

    if (!isUndefined(name) && !isNull(name)) {
      if (name === user.name) {
        throw new RpcException('Name must be different');
      }

      user.name = formatName(name);
    }
    await this.saveEntity(user);

    return user;
  }

  /**
   * Remove a user.
   *
   * @param {string} id User's id
   * @returns {Promise<User>} Removed user
   * @throws {Error} If user does not exist
   */
  public async remove(id: string): Promise<User> {
    const user = await this.findOneById(id);
    await this.removeEntity(user);

    return user;
  }

  private throwUnauthorizedException(user: undefined | null | User): void {
    if (isUndefined(user) || isNull(user)) {
      throw new RpcException('Invalid credentials');
    }
  }

  private async isEmailUnique(email: string): Promise<void> {
    const usersCount = await this.userRepository
      .schema(this.getTenantId())
      .count({ where: { email } });
    if (usersCount > 0) {
      throw new RpcException(EMAIL_ALREADY_IN_USE);
    }
  }
}
