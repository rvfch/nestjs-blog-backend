import { isNull, isUndefined } from '@app/common/helpers/validation.helpers';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable({ scope: Scope.REQUEST })
export class TenantStateService {
  constructor(private readonly sequelize: Sequelize) {}

  private _tenantId: string;

  public getTenantId(): string {
    return this._tenantId;
  }

  private setTenantId(tenantId: string) {
    this._tenantId = tenantId;
  }

  public async handleTenantId(tenantId: string): Promise<void> {
    const formattedTenantId = this.formatTenantId(tenantId);
    await this.checkTenantExists(formattedTenantId);
    this.setTenantId(formattedTenantId);
  }

  public async checkTenantExists(tenantId: string): Promise<void> {
    let tenantExists: boolean;
    // TODO: add caching
    try {
      const result = await this.sequelize.query(
        `SELECT TRUE FROM information_schema.schemata WHERE schema_name = $schemaName`,
        {
          bind: { schemaName: tenantId },
          type: QueryTypes.SELECT,
        },
      );

      tenantExists = result && result.length > 0;
    } catch (e) {
      throw new InternalServerErrorException('Unable to verify tenant.');
    }

    if (!tenantExists) {
      throw new BadRequestException(
        'Tenant not exists. Please create new tenant, using api/tenantLogin.',
      );
    }
  }

  private formatTenantId(tenantId: string): string | null {
    if (!isNull(tenantId) && !isUndefined(tenantId)) {
      if (tenantId.includes('tenant_')) {
        return tenantId;
      } else {
        return `tenant_${tenantId}`;
      }
    }
    return null;
  }
}
