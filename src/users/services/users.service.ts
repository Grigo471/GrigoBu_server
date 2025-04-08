import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, UserSubscriber } from '../models/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { getProfileDto, UserDto } from '../dto/UserDto';
import { FileService } from 'src/file';
import { Op } from 'sequelize';
import { NotificationsService } from 'src/notifications/services/notifications.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,

        @InjectModel(UserSubscriber)
        private userSubscriberModel: typeof UserSubscriber,

        private notificationsService: NotificationsService,
        private fileService: FileService,
    ) {}

    async updateAvatar(id: number, file?: Express.Multer.File) {
        if (!file) {
            throw new HttpException(`No image file`, HttpStatus.BAD_REQUEST);
        }
        const user = await this.userModel.findOne({ where: { id } });

        if (!user) {
            throw new HttpException(
                { error: `User not found`, status: HttpStatus.BAD_REQUEST },
                HttpStatus.BAD_REQUEST,
            );
        }

        const avatar = this.fileService.createFile(file);

        user.avatar = avatar;
        await user.save();

        return user.avatar;
    }

    async updateStatus(dto: UserDto) {
        const user = await this.userModel.findOne({ where: { id: dto.id } });

        if (!user) {
            throw new HttpException(
                `User ${dto.username} not found`,
                HttpStatus.BAD_REQUEST,
            );
        }

        user.status = dto.status;

        return user;
    }

    async subscribe(subscriptionId: number, subscriberId: number) {
        await this.userSubscriberModel.create({
            subscriberId,
            subscriptionId,
        });

        const subscribers = await this.userSubscriberModel.count({
            where: { subscriptionId },
        });

        const subscriber = await this.userModel.findOne({
            where: { id: subscriberId },
        });

        if (subscribers === 1 || subscribers % 5 === 0) {
            await this.notificationsService.createNotifications({
                userId: subscriptionId,
                type: 'subsNumber',
                value: subscribers,
            });
        }

        await this.notificationsService.createNotifications({
            userId: subscriptionId,
            type: 'smbSubscribed',
            name: subscriber.username,
        });

        return subscriptionId;
    }

    async unsubscribe(subscriptionId: number, subscriberId: number) {
        await this.userSubscriberModel.destroy({
            where: { subscriberId, subscriptionId },
        });

        return subscriptionId;
    }

    async findAll(
        sort: 'rating' | 'createdAt' | 'username',
        order: 'asc' | 'desc',
        search: string,
        userId?: number,
    ): Promise<getProfileDto[]> {
        const users = await this.userModel
            .scope('withoutPassword')
            .findAll<User>({
                where: {
                    username: {
                        [Op.iLike]: '%' + search + '%',
                    },
                },
                include: [
                    { model: UserSubscriber, as: 'subscriptions' },
                    { model: UserSubscriber, as: 'subscribers' },
                ],
                order: [[sort, order]],
            });

        if (!userId) return users.map((user) => new getProfileDto(user));

        const usersWithSubInfo = users.map((user) => {
            const amISubscribed = user.subscribers.some(
                (sub) => sub.subscriberId === userId,
            );
            return new getProfileDto(user, amISubscribed);
        });

        return usersWithSubInfo;
    }

    async getSubscriptions(
        sort: 'rating' | 'createdAt' | 'username',
        order: 'asc' | 'desc',
        search: string,
        userId: number,
    ): Promise<getProfileDto[]> {
        const subscriptions = await this.userModel
            .scope('withoutPassword')
            .findByPk(userId, {
                include: [
                    {
                        model: UserSubscriber,
                        as: 'subscriptions',
                        include: [
                            {
                                model: User,
                                as: 'subscription',
                                where: {
                                    username: {
                                        [Op.iLike]: '%' + search + '%',
                                    },
                                },
                                include: [
                                    {
                                        model: UserSubscriber,
                                        as: 'subscriptions',
                                    },
                                    {
                                        model: UserSubscriber,
                                        as: 'subscribers',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                order: [
                    [
                        { model: UserSubscriber, as: 'subscriptions' },
                        { model: User, as: 'subscription' },
                        sort,
                        order,
                    ],
                ],
            })
            .then((user) =>
                user.subscriptions.map(
                    (sub) => new getProfileDto(sub.subscription, true),
                ),
            );
        return subscriptions;
    }

    async getSubscribers(
        sort: 'rating' | 'createdAt' | 'username',
        order: 'asc' | 'desc',
        search: string,
        userId: number,
    ): Promise<getProfileDto[]> {
        const subscribers = await this.userSubscriberModel
            .findAll({
                where: {
                    subscriptionId: userId,
                },
                include: [
                    {
                        model: User,
                        as: 'subscriber',
                        where: {
                            username: {
                                [Op.iLike]: '%' + search + '%',
                            },
                        },
                        include: [
                            { model: UserSubscriber, as: 'subscriptions' },
                            { model: UserSubscriber, as: 'subscribers' },
                        ],
                    },
                ],
                order: [[{ model: User, as: 'subscriber' }, sort, order]],
            })
            .then((data) => data.map((sub) => sub.subscriber));

        const subscribersWithSubInfo = subscribers.map((subscriber) => {
            const amISubscribed = subscriber.subscribers.some(
                (sub) => sub.subscriberId === userId,
            );
            return new getProfileDto(subscriber, amISubscribed);
        });

        return subscribersWithSubInfo;
    }

    async findOne(username: string, userId?: number): Promise<getProfileDto> {
        const user = await this.userModel
            .scope('withoutPassword')
            .findOne<User>({
                include: [
                    {
                        model: UserSubscriber,
                        as: 'subscribers',
                    },
                    {
                        model: UserSubscriber,
                        as: 'subscriptions',
                    },
                ],
                where: { username },
            });

        if (!userId || userId === user.id) {
            return new getProfileDto(user);
        }

        const amISubscribed = user.subscribers.some(
            (sub) => sub.subscriberId === userId,
        );
        return new getProfileDto(user, amISubscribed);
    }
}
