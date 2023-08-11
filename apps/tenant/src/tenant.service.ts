import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { Tenant } from '@app/common/entity/tenant.model';
import { Sequelize } from 'sequelize-typescript';
import { Article } from '@app/common/entity/article.model';
import { Rating } from '@app/common/entity/rating.model';
import { Comment } from '@app/common/entity/comment.model';
import { ArticleImage } from '@app/common/entity/article-image.model';
import { SequelizeConfig } from '@app/common/config/sequelize.config';
import { BaseService } from '@app/common/core/services/base.service';
import { User } from '@app/common/entity/user.model';
import { Credentials } from '@app/common/entity/credentials.model';
import { InjectModel } from '@nestjs/sequelize';
import { hash } from 'argon2';
import { BlacklistedToken } from '@app/common/entity/blacklisted-token.model';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { UserImage } from '@app/common/entity/user-image.model';
import { TenantDto } from '@app/common/dto/tenant/tenant.dto';

@Injectable({ scope: Scope.REQUEST })
export class TenantService extends BaseService {
  constructor(
    protected readonly sequelize: Sequelize,
    private readonly sequelizeConfig: SequelizeConfig,
    @InjectModel(Tenant)
    private readonly tenantRepository: typeof Tenant,
    protected readonly tenantStateService: TenantStateService,
  ) {
    super(sequelize, tenantStateService);
  }

  /**
   * This function finds a tenant by name.
   *
   * @param name: string
   * @return tenant: Promise<Tenant>
   * @throws NotFoundException if tenant does not exist
   */
  public async findOneByName(name: string): Promise<Tenant> {
    // 1. Find user by ID
    const tenant = await this.tenantRepository.findOne({
      where: { name },
    });
    // 2. Checks if entity exists
    this.isEntityExists(tenant, 'Tenant');

    return tenant;
  }

  /**
   * This function finds a tenant by id.
   *
   * @return tenant: Promise<Tenant>
   * @throws NotFoundException if tenant does not exist
   */
  public async verifyTenant(): Promise<TenantDto> {
    // 1. Find user by ID
    const tenant = await this.tenantRepository.findOne({
      where: { id: this.getIdFromTenant(this.getTenantId()) },
    });
    // 2. Checks if entity exists
    this.isEntityExists(tenant, 'Tenant');

    return tenant;
  }

  private getIdFromTenant(tenantId: string) {
    return tenantId.split('_')[1];
  }

  /**
   * This function loads a tenant based on provided dtoIn.
   * If the tenant is not found, it creates a new tenant and its corresponding schema.
   *
   * @param dtoIn: LoadTenantDtoIn
   * @return tenant: Promise<Tenant>
   * @throws InternalServerErrorException if password hashing fails
   * @throws NotFoundException if tenant does not exist
   */
  public async loadTenant(dtoIn: TenantDto): Promise<TenantDto> {
    try {
      return await this.findOneByName(dtoIn.name);
    } catch (e) {
      if (e instanceof NotFoundException) {
        // 1. Hash the password
        let hashedPassword;
        try {
          hashedPassword = await hash(dtoIn.password);
        } catch (e) {
          throw new InternalServerErrorException(e);
        }
        // 2. Create new tenant
        const tenant = await this.tenantRepository.create<Tenant>({
          ...dtoIn,
          password: hashedPassword,
        });

        // 3. Create new schema
        const schemaName = `tenant_${tenant.id}`;
        try {
          await this.sequelize.authenticate();
          await this.sequelize.createSchema(schemaName, { logging: true });

          const sequelizeConfig = this.sequelizeConfig.createSequelizeOptions();
          const tenantSequelize = new Sequelize({
            ...sequelizeConfig,
            define: {
              ...sequelizeConfig.define,
              schema: schemaName,
              freezeTableName: true,
            },
            // Omit default models
            models: [],
          });
          // 3.1. Add entities to schema
          tenantSequelize.addModels([
            User,
            Credentials,
            Article,
            Comment,
            UserImage,
            ArticleImage,
            Rating,
            BlacklistedToken,
          ]);
          await tenantSequelize.sync();

          // 4. Process dtoOut
          return tenant;
        } catch (err) {
          throw err;
        }
      }
    }
  }
}
