import { Injectable } from '@nestjs/common';
import { User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { RegisterUserDto } from './dto/RegisterUserDto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async register(dto: RegisterUserDto): Promise<User> {
    console.log(dto);
    return this.userModel.create({
      username: dto.username,
      password: dto.password,
    });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll<User>();
  }
}
