import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationModel } from '../models/notification.model';
import { CreateNotificationDto } from '../dto/createNotificationDto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(NotificationModel)
        private notificationModel: typeof NotificationModel,
    ) {}

    async viewNotifications(userId: number) {
        const notifications = await this.notificationModel.findAll({
            where: { userId },
            order: [['createdAt', 'desc']],
        });

        console.log('view');

        Promise.all(
            notifications.map(async (notification) => {
                if (notification.isSeen === false) {
                    notification.isSeen = true;
                    await notification.save();
                }
            }),
        );

        return notifications;
    }

    async getNotifications(userId: number) {
        const notifications = await this.notificationModel.findAll({
            where: { userId },
            order: [['createdAt', 'desc']],
        });

        return notifications;
    }

    async getNotificationsCount(userId: number) {
        const notificationsCount = await this.notificationModel.count({
            where: {
                userId,
                isSeen: false,
            },
        });

        return notificationsCount;
    }

    async createNotifications(dto: CreateNotificationDto) {
        const notification = await this.notificationModel.create(dto);
        return notification;
    }
}
