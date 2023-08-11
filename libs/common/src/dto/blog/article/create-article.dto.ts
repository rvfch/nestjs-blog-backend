import { IArticle } from '@app/common/entity/interface/article.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateArticleDto implements Partial<IArticle> {
  @ApiProperty()
  @IsString()
  @Length(5, 100)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(10, 255)
  perex: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
