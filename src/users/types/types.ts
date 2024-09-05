import { User } from '..';

export type UserRole = 'admin' | 'moderator' | 'user';
export type Theme = 'light' | 'dark';
export type Language = 'english' | 'russian';

export type NotificationType = 'comment' | 'answer' | 'rating' | 'subscribers';

export interface getUserInterface {
  user: User;
  amISubscribed?: boolean;
}
