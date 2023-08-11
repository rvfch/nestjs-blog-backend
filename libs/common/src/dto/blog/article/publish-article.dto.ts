import { IArticle } from '@app/common/entity/interface/article.interface';
import { ApiProperty } from '@nestjs/swagger';

export class PublishArticleDto implements Partial<IArticle> {
  @ApiProperty()
  id: string;
}
