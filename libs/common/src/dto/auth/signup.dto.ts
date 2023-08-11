import { IsEmail, IsIP, IsNotEmpty, IsString, Length } from 'class-validator';
import { PasswordsDto } from './passwords.dto';
import { ApiProperty } from '@nestjs/swagger';

export abstract class SignUpDto extends PasswordsDto {
  @ApiProperty()
  @IsString()
  @Length(3, 50, {
    message: 'Name has to be between 3 and 50 characters.',
  })
  public name!: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  public password2!: string;
}
