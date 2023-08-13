import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RateCommentDto {
  @Field()
  userId: string;

  @Field()
  commentId: string;

  @Field()
  isUpvote: boolean;
}
