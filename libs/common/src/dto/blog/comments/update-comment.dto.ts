import { IComment } from '@app/common/entity/interface/comment.interface';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateCommentDto implements Partial<IComment> {
  @Field()
  id: string;

  @Field()
  text?: string;
}
