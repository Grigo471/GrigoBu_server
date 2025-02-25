import { User } from '../models/users.model';

export interface UserDto {
    id: number;
    username: string;
    avatar?: string;
    status?: string;
}

export class getProfileDto {
    id: number;
    username: string;
    avatar: string;
    status: string;
    rating: number;
    role: string;
    createdAt: string;
    subscribers?: number;
    subscriptions?: number;
    amISubscribed?: boolean;

    constructor(user: User, amISubscribed?: boolean) {
        this.id = user.id;
        this.username = user.username;
        this.avatar = user.avatar;
        this.status = user.status;
        this.rating = user.rating;
        this.role = user.role;
        this.createdAt = user.createdAt;
        this.subscribers = user.subscribers?.length;
        this.subscriptions = user.subscriptions?.length;
        this.amISubscribed = amISubscribed;
    }
}
