import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MinLength } from 'class-validator';

export abstract class PasswordsDto {
  @ApiProperty()
  @IsString()
  @Length(5, 255)
  public password1!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @IsOptional()
  public password2?: string;
}
