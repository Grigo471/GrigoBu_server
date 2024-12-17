import { ApiProperty } from '@nestjs/swagger';
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { User } from 'src/users';
import { NotificationType } from '../types/types';

interface NotificationCreationAttributes {
    type: NotificationType;
    value?: number;
    name?: string;
    userId: number;
}

@Table
export class NotificationModel extends Model<
    NotificationModel,
    NotificationCreationAttributes
> {
    @ApiProperty({
        example: 'comment',
        description:
            'Тип уведомления (на Вас подписались, Вы получили достижение)',
    })
    @Column({ type: DataType.STRING, allowNull: false })
    type: string;

    @ApiProperty({
        example: '15',
        description:
            'Числовой параметр, например рейтинг, который заработал пользователь',
    })
    @Column({ type: DataType.INTEGER, allowNull: true })
    value: number;

    @ApiProperty({
        example: 'Grigo2',
        description: 'Имя пользователя, с которым связано уведомление',
    })
    @Column({ type: DataType.STRING, allowNull: true })
    name: string;

    @ApiProperty({
        example: 'true',
        description: 'Было ли данное уведомление просмотрено',
    })
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isSeen: boolean;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @ApiProperty({
        description: 'Пользователь, которому предназначено уведомление',
    })
    @BelongsTo(() => User)
    user: User;
}
