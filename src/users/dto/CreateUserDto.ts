import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'user@mail.ru', description: 'Почта' })
    @IsString({ message: 'Должно быть строкой' })
    @Length(5, 16, { message: 'Не меньше 5 и не больше 16' })
    readonly username: string;
    @ApiProperty({ example: '12345', description: 'пароль' })
    @IsString({ message: 'Должно быть строкой' })
    @Length(5, 16, { message: 'Не меньше 5 и не больше 16' })
    readonly password: string;
}
