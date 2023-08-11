import { ArticleStatus } from '@app/common/entity/enums/articlestatus.enum';
import { IArticle } from '@app/common/entity/interface/article.interface';
import { IUser } from '@app/common/entity/interface/user.interface';
import { Exclude } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';
import { PageDto } from '../../utils/page.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UserDto } from '../../users/user.dto';

export class ArticleDto
  extends IntersectionType(PageDto)
  implements Partial<IArticle>
{
  constructor(article: IArticle) {
    super();
    this.id = article.id;
    this.title = article.title;
    this.perex = article.perex;
    this.content = article.content;
    this.status = article.status;
    this.user = article.user && new UserDto(article.user);
    this.createdAt = article.createdAt;
    this.updatedAt = article.updatedAt;
    this.imageUrl = article.image?.url;
    // FIXME: fix variable
    this.commentsCount =
      Number((article as any).dataValues?.commentsCount) || 0;
  }

  @ApiProperty()
  @Exclude({ toClassOnly: true })
  @IsUUID(4)
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  perex: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @Exclude({ toClassOnly: true })
  status: ArticleStatus;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  @IsUUID(4)
  author?: string;

  @ApiProperty()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @Exclude({ toClassOnly: true })
  user: IUser;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;

  @ApiProperty()
  @Exclude({ toClassOnly: true })
  @IsNumber()
  commentsCount?: number;
}
