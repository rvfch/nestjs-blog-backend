import { IUser } from './user.interface';

export interface IComment {
  id: string;
  text: string;
  ratingScore: number;
  user?: IUser;
  articleId: string;
  parentId?: string | null;
  children?: IComment[];
  canVote?: boolean;
  createdAt?: string;
}
