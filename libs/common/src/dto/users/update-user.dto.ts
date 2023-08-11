import { IsString, Length } from 'class-validator';
import { IUser } from '@app/common/entity/interface/user.interface';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto implements Partial<IUser> {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  name!: string;
}
