import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, UserSubscriber } from '../models/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { UserDto } from '../dto/UserDto';
import { FileService } from 'src/file';
import { Notification } from '../models/notification.model';
import { getUserInterface } from '../types/types';
import { Op } from 'sequelize';
import { AuthRequest } from 'src/middlewares/authMiddleware';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserSubscriber)
    private userSubscriberModel: typeof UserSubscriber,
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
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
    // const subscribers = await this.userModel.findAll({
    //   where: { subscriptionId },
    // });

    // if (subscribers.length === 1 || subscribers.length % 5 === 0) {
    //   await this.notificationModel.create({
    //     userId: subscriptionId,
    //     type: 'subscribe',
    //     value: subscribers.length,
    //   });
    // }

    return true;
  }

  async unsubscribe(subscriptionId: number, subscriberId: number) {
    await this.userSubscriberModel.destroy({
      where: { subscriberId, subscriptionId },
    });

    return true;
  }

  async viewNotifications(userId: number) {
    const notifications = await this.notificationModel.findAll({
      where: { userId },
    });

    await notifications.forEach(async (notification) => {
      if (notification.isSeen === false) {
        notification.isSeen = true;
        await notification.save();
      }
    });

    return notifications;
  }

  async findAll(
    sort: 'rating' | 'createdAt' | 'username',
    order: 'asc' | 'desc',
    search: string,
  ): Promise<User[]> {
    return this.userModel.scope('withoutPassword').findAll<User>({
      where: {
        username: {
          [Op.iLike]: '%' + search + '%',
        },
      },
      order: [[sort, order]],
    });
  }

  async getSubscriptions(
    { userId }: AuthRequest,
    sort: 'rating' | 'createdAt' | 'username',
    order: 'asc' | 'desc',
    search: string,
  ): Promise<User[]> {
    const subscriptions = await this.userSubscriberModel
      .findAll({
        where: {
          subscriberId: userId,
        },
        include: [{ model: User, as: 'subscribtion' }],
      })
      .then((data) => data.map((sub) => sub.subscriptionId));

    return this.userModel.scope('withoutPassword').findAll<User>({
      where: {
        username: {
          [Op.iLike]: '%' + search + '%',
        },
        id: subscriptions,
      },
      order: [[sort, order]],
    });
  }

  async findOne(username: string, userId?: number): Promise<getUserInterface> {
    const user = await this.userModel.scope('withoutPassword').findOne<User>({
      where: { username },
    });

    if (!userId) {
      return { user };
    }

    const subscribeRelation = await this.userSubscriberModel.findOne({
      where: {
        subscriberId: userId,
        subscriptionId: user.id,
      },
    });
    const amISubscribed = Boolean(subscribeRelation);
    return { user, amISubscribed };
  }
}
