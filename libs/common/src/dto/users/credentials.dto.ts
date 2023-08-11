import { ICredentials } from '@app/common/entity/interface/credentials.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CredentialsDto implements Partial<ICredentials> {
  @ApiProperty()
  @IsUUID(4)
  userId: string;

  @ApiProperty()
  @IsNumber()
  version: number;

  @ApiProperty()
  @IsString()
  lastPassword: string;

  @ApiProperty()
  @IsNumber()
  passwordUpdatedAt: number;
}
