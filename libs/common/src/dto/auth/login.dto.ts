import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';
import { PasswordsDto } from './passwords.dto';

export abstract class LoginDto extends PasswordsDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email!: string;
}
