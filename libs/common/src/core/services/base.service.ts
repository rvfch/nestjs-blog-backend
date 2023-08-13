import { MessageDto } from '@app/common/dto/utils/message.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import { catchError, firstValueFrom, of } from 'rxjs';
import { UniqueConstraintError } from 'sequelize';
import { Model, Sequelize } from 'sequelize-typescript';
import { v4 } from 'uuid';
import { POSTGRES_DUPLICATE_ERROR_MESSAGE } from '../../constants/constants';
import { isNull, isUndefined } from '../../helpers/validation.helpers';
import { IAccessToken } from '../../interface/auth/token/access-token.interface';
import { IEmailToken } from '../../interface/auth/token/email-token.interface';
import { IRefreshToken } from '../../interface/auth/token/refresh-token.interface';
import { TenantStateService } from './tenant-state.service';

/**
 * This is the base class for all service classes
 */
@Injectable({ scope: Scope.REQUEST })
export abstract class BaseService {
  protected readonly logger: LoggerService;

  constructor(
    protected readonly sequelize: Sequelize,
    protected readonly tenantStateService: TenantStateService,
    protected readonly client: ClientProxy = null,
  ) {
    // Use logger
    this.logger = new Logger(BaseService.name);
  }

  public getTenantId(): string {
    return this.tenantStateService.getTenantId();
  }

  protected async getData<T>(methodName: string, data?: any): Promise<T> {
    if (this.client) {
      const response: unknown = await firstValueFrom(
        this.client
          .send<unknown, any>(methodName, [data, this.getTenantId()])
          .pipe(catchError((error) => of({ error }))),
      );

      if ((response as { error?: any }).error) {
        throw new BadRequestException((response as { error: any }).error);
      }

      return response as T;
    }
  }

  /**
   * This function validates the entity
   *
   * @param entity: Model
   * @return Promise<void>
   * @throw 400
   */
  public async validateEntity(entity: Model): Promise<void> {
    const errors: string[] = [];
    // 1. Validate entity
    try {
      await entity.validate();
    } catch (e) {
      // 2. Process errors
      e.errors?.forEach((e) => {
        errors.push(e.message);
      });
    }
    // 3. IF errors THEN throw 400
    if (errors.length > 0) {
      throw new BadRequestException(errors.join(',\n'));
    }
  }

  public generateMessage(message: string): MessageDto {
    return { id: v4(), message };
  }

  /**
   * This function checks PostgreSQL duplicate error 23505
   *
   * @param promise: Promise<T>
   * @param message?: string
   * @return promise
   * @throw 409 or 400
   */
  public async throwDuplicateError<T>(promise: Promise<T>, message?: string) {
    try {
      return await promise;
    } catch (e) {
      this.logger.error(e);
      if (e instanceof UniqueConstraintError) {
        throw new ConflictException(
          message ?? POSTGRES_DUPLICATE_ERROR_MESSAGE,
        );
      }
      throw new BadRequestException(e.message);
    }
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
      this.logger.error(e);
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

  /**
   * This function checks entity existence
   *
   * @param entity: T extends Model
   * @param name: string
   * @return void
   * @throw 404
   */
  public isEntityExists<T extends Model>(
    entity: T | null | undefined,
    name: string,
  ): void {
    if (isNull(entity) || isUndefined(entity)) {
      throw new NotFoundException(`Entity ${name} not found`);
    }
  }

  public async saveEntity<T extends Model>(
    entity: T,
    isNew = false,
  ): Promise<void> {
    await this.validateEntity(entity);
    await this.throwDuplicateError(
      this.sequelize.transaction(async (t) => {
        if (isNew) {
          await entity.save({ transaction: t });
        }
      }),
    );
  }

  public async removeEntity<T extends Model>(entity: T): Promise<void> {
    await this.throwInternalError(entity.destroy());
  }
}
