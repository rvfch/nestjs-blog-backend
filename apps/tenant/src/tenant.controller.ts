import { LOAD_TENANT, VERIFY_TENANT } from '@app/common/constants/constants';
import { TenantInterceptor } from '@app/common/core/interceptors/tenant.interceptor';
import { TenantDto } from '@app/common/dto/tenant/tenant.dto';
import { Controller, UseInterceptors } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RedisContext,
} from '@nestjs/microservices';
import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * This method responds to the 'load_tenant' message pattern.
   * It gets a LoadTenantDtoIn payload and loads a tenant based on the provided dtoIn.
   * If the tenant is not found, it creates a new tenant and its corresponding schema.
   *
   * @param dtoIn: LoadTenantDtoIn
   * @param ctx: RedisContext
   * @return tenant: Promise<Tenant>
   */
  @MessagePattern(LOAD_TENANT)
  public async tenantInit(
    @Payload() dtoIn: TenantDto,
    @Ctx() ctx: RedisContext,
  ): Promise<TenantDto> {
    return await this.tenantService.loadTenant(dtoIn);
  }

  @UseInterceptors(TenantInterceptor)
  @MessagePattern(VERIFY_TENANT)
  public async getById(@Ctx() ctx: RedisContext): Promise<TenantDto> {
    return await this.tenantService.verifyTenant();
  }
}
