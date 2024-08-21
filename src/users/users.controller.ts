import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.model';
import { RegisterUserDto } from './dto/RegisterUserDto';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('')
  registration(@Body() dto: RegisterUserDto) {
    try {
      this.usersService.register(dto);
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
