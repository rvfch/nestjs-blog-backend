import { IBlacklistedToken } from '@app/common/entity/interface/blacklisted-token.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class BlacklistedTokenDto implements Partial<IBlacklistedToken> {
  @ApiProperty()
  @IsUUID(4)
  userId!: string;

  @ApiProperty()
  @IsString()
  tokenId!: string;
}
