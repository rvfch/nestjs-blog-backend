import { IsEmail, IsString, Length } from 'class-validator';
import { PasswordsDto } from './passwords.dto';
import { ApiProperty } from '@nestjs/swagger';

export abstract class LoginDto extends PasswordsDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email!: string;
}
