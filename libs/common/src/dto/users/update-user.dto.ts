import { IUser } from '@app/common/entity/interface/user.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserDto implements Partial<IUser> {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  name!: string;
}
