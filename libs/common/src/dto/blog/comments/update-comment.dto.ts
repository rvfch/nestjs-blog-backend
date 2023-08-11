import { IComment } from '@app/common/entity/interface/comment.interface';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateCommentDto implements Partial<IComment> {
  @Field()
  id: string;

  @Field()
  text?: string;
}
