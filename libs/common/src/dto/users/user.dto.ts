import { ICredentials } from '@app/common/entity/interface/credentials.interface';
import { IUser } from '@app/common/entity/interface/user.interface';
import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsBoolean, IsEmail, IsString, IsUUID } from 'class-validator';

@ObjectType()
export class UserDto implements Partial<IUser> {
  constructor(user: IUser) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.isActive = user.isActive;
    this.isAdmin = user.isAdmin;
  }

  @ApiProperty()
  @Exclude({ toClassOnly: true })
  @IsUUID(4)
  @Field()
  id?: string;

  @ApiProperty()
  @IsEmail()
  @Field()
  email: string;

  @ApiProperty()
  @IsString()
  @Field()
  name: string;

  @Exclude({ toPlainOnly: true })
  @IsString()
  password?: string;

  @IsBoolean()
  @Exclude({ toClassOnly: true })
  isAdmin?: boolean;

  @IsBoolean()
  @Exclude({ toClassOnly: true })
  isActive?: boolean;

  @Exclude()
  credentials?: ICredentials;

  @ApiProperty()
  @Exclude({ toClassOnly: true })
  createdAt?: Date;

  @ApiProperty()
  @Exclude({ toClassOnly: true })
  updatedAt?: Date;
}
