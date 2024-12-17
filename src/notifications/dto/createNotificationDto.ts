import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { NotificationType } from '../types/types';

export class CreateNotificationDto {
    @ApiProperty({ example: 'comment', description: 'Тип уведомления' })
    @IsString({ message: 'Должно быть строкой' })
    readonly type: NotificationType;

    @ApiProperty({
        example: '15',
        description: 'Числовой параметр уведомления',
    })
    @IsNumber({ allowNaN: true })
    readonly value?: number;

    @ApiProperty({
        example: 'Grigo1',
        description: 'Имя пользователя, связанного с данным уведомлением',
    })
    @IsString({ message: 'Должно быть строкой' })
    readonly name?: string;

    @ApiProperty({
        example: '1',
        description: 'id пользователя, которому предназначено уведомление',
    })
    @IsNumber({ allowNaN: false })
    readonly userId: number;
}
