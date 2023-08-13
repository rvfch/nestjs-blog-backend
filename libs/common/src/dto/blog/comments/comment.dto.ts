import { IComment } from '@app/common/entity/interface/comment.interface';
import { Field, ObjectType } from '@nestjs/graphql';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserDto } from '../../users/user.dto';

@ObjectType()
export class CommentDto implements Partial<IComment> {
  @IsUUID(4)
  @Field()
  id: string;

  @IsUUID(4)
  @Field()
  articleId: string;

  @IsObject()
  @Field((type) => UserDto)
  user: UserDto;

  @IsString()
  @Field()
  text: string;

  @IsNumber()
  @Field()
  ratingScore: number;

  @Field({ defaultValue: true })
  canVote: boolean;

  @Field({ nullable: true })
  @IsUUID(4)
  @IsOptional()
  parentId?: string;

  @Field(() => [CommentDto], { nullable: true })
  children?: CommentDto[];

  @Field()
  createdAt?: string;

  constructor(comment: IComment, canVote?: boolean) {
    this.canVote = canVote || comment.canVote;
    this.id = comment.id;
    this.articleId = comment.articleId;
    this.user = new UserDto(comment.user);
    this.text = comment.text;
    this.ratingScore = comment.ratingScore;
    this.parentId = comment.parentId;
    this.children = comment.children?.map(
      (child) => new CommentDto(child, child.canVote),
    );
    this.createdAt = new Date(comment.createdAt).toISOString();
  }
}
