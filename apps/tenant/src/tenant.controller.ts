import { Controller, UseInterceptors } from '@nestjs/common';
import { TenantService } from './tenant.service';
import {
  Ctx,
  Payload,
  RedisContext,
  MessagePattern,
} from '@nestjs/microservices';
import { TenantDto } from '@app/common/dto/tenant/tenant.dto';
import { TenantInterceptor } from '@app/common/core/interceptors/tenant.interceptor';

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
  @MessagePattern('load_tenant')
  public async tenantInit(
    @Payload() dtoIn: TenantDto,
    @Ctx() ctx: RedisContext,
  ): Promise<TenantDto> {
    return await this.tenantService.loadTenant(dtoIn);
  }

  @UseInterceptors(TenantInterceptor)
  @MessagePattern('verify_tenant')
  public async getById(@Ctx() ctx: RedisContext): Promise<TenantDto> {
    return await this.tenantService.verifyTenant();
  }
}
