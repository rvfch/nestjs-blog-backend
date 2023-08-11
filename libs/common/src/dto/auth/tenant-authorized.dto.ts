import { ApiProperty } from '@nestjs/swagger';

export class TenantAuthorizedDto {
  @ApiProperty()
  apiKey!: string;
}
