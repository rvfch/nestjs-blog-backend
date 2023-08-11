import { ArticleStatus } from '../enums/articlestatus.enum';
import { IImage } from './image.interface';
import { IUser } from './user.interface';

export interface IArticle {
  id: string;
  title: string;
  perex: string;
  content: string;
  status: ArticleStatus;
  author?: string;
  user: IUser;
  createdAt?: Date;
  updatedAt?: Date;
  image?: IImage;
  commentsCount?: number;
}
