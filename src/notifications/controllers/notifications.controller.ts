import { Controller, Get, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { AuthRequest } from 'src/middlewares/authMiddleware';
import { NotificationModel } from '../models/notification.model';

@ApiTags('Уведомления')
@Controller('/notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post()
    viewNotifications(@Req() req: AuthRequest): Promise<NotificationModel[]> {
        return this.notificationsService.viewNotifications(req.userId);
    }

    @Get()
    getNotifications(@Req() req: AuthRequest): Promise<NotificationModel[]> {
        return this.notificationsService.getNotifications(req.userId);
    }

    @Get('/count')
    getNotificationsCount(@Req() req: AuthRequest): Promise<number> {
        return this.notificationsService.getNotificationsCount(req.userId);
    }
}
