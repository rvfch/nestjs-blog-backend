import { ITenant } from '@app/common/entity/interface/tenant.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class TenantDto implements Partial<ITenant> {
  @Exclude({ toPlainOnly: true })
  @IsOptional()
  @IsUUID(4)
  @ApiProperty({ required: false })
  id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @ApiProperty({ required: true })
  name!: string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @ApiProperty({ required: true })
  password!: string;
}
