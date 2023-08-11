import { IComment } from '@app/common/entity/interface/comment.interface';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCommentDto implements Partial<IComment> {
  @Field()
  articleId!: string;

  @Field()
  userId!: string;

  @Field()
  text: string;

  @Field({ nullable: true })
  parentId?: string;
}
