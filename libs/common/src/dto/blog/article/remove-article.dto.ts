import { IArticle } from '@app/common/entity/interface/article.interface';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveArticleDto implements Partial<IArticle> {
  @ApiProperty()
  id!: string;
}
