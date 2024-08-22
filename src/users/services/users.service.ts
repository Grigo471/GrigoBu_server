import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User, UserSubscriber } from '../models/users.model';
import { InjectModel } from '@nestjs/sequelize';
import { UserDto } from '../dto/UserDto';
import { FileService } from 'src/file';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(User)
    private userSubscriberModel: typeof UserSubscriber,
    private fileService: FileService,
  ) {}

  async updateAvatar(id: number, file?: Express.Multer.File) {
    if (!file) {
      throw new HttpException(`No image file`, HttpStatus.BAD_REQUEST);
    }
    const user = await this.userModel.findOne({ where: { id } });

    if (!user) {
      throw new HttpException(`User not found`, HttpStatus.BAD_REQUEST);
    }

    const avatar = await this.fileService.createFile(file);

    user.avatar = avatar;
    user.save();

    return user;
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

  async subscribe(subscriberId: number, subscriptionId: number) {
    await this.userSubscriberModel.create({ subscriberId, subscriptionId });

    const subscribers = await this.userModel.findAll({
      where: { subscriberId },
    });

    return subscribers;
  }

  async unsubscribe(subscriberId: number, subscriptionId: number) {
    await this.userSubscriberModel.destroy({
      where: { subscriberId, subscriptionId },
    });

    const subscribers = await this.userModel.findAll({
      where: { subscriberId },
    });

    return subscribers;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll<User>();
  }
}
