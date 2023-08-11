import { BaseService } from '@app/common/core/services/base.service';
import { TenantStateService } from '@app/common/core/services/tenant-state.service';
import { BlacklistedTokenDto } from '@app/common/dto/users/blacklisted-token.dto';
import { BlacklistedToken } from '@app/common/entity/blacklisted-token.model';
import { Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable({ scope: Scope.REQUEST })
export class BlacklistedTokenService extends BaseService {
  constructor(
    protected readonly sequelize: Sequelize,
    @InjectModel(BlacklistedToken)
    private blacklistedTokensRepository: typeof BlacklistedToken,
    protected readonly tenantStateService: TenantStateService,
  ) {
    super(sequelize, tenantStateService);
  }

  public async create(dtoIn: BlacklistedTokenDto): Promise<BlacklistedToken> {
    const blacklistedToken = this.blacklistedTokensRepository
      .schema(this.getTenantId())
      .build({
        userId: dtoIn.userId,
        tokenId: dtoIn.tokenId,
      });
    await this.saveEntity(blacklistedToken, true);

    return blacklistedToken;
  }

  public async verifyBlacklistedToken(
    dtoIn: BlacklistedTokenDto,
  ): Promise<boolean> {
    const count = await this.blacklistedTokensRepository.count({
      where: {
        tokenId: dtoIn.tokenId,
        userId: dtoIn.userId,
      },
    });

    return count > 0;
  }
}
