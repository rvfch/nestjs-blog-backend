import { UserDto } from '../users/user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResultDto {
  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
