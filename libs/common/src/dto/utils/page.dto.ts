import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class PageDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  page?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  pageSize?: number;
}
