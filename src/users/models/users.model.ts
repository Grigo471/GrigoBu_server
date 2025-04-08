import {
    Table,
    Column,
    Model,
    HasMany,
    HasOne,
    ForeignKey,
    Scopes,
    BelongsTo,
    DataType,
} from 'sequelize-typescript';
import { Token } from './token.model';
import { CommentModel } from 'src/comments';
import { Article, ArticleRate } from 'src/articles';
import { UserSettings } from './userSettings';
import { ApiProperty } from '@nestjs/swagger';

interface UserCreationAttributes {
    username: string;
    password: string;
}

@Scopes(() => ({
    withoutPassword: { attributes: { exclude: ['password'] } },
}))
@Table
export class User extends Model<User, UserCreationAttributes> {
    @ApiProperty({
        example: 'Grigo',
        description: 'Уникальное имя пользователя',
    })
    @Column({ type: DataType.STRING(24), unique: true, allowNull: false })
    username: string;

    @ApiProperty({
        description: 'Хэшированный пароль пользователя',
    })
    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @ApiProperty({
        example: '1dded74a-4d38-4640-a9f0-527f1b017c42.jpg',
        description: 'Имя файла с аватаркой, находящегося в папке static',
    })
    @Column({ type: DataType.STRING, allowNull: true })
    avatar: string;

    @ApiProperty({
        example: 'Всем привет! Меня зовут Григо, я люблю Властелин колец',
        description: 'Статус пользователя, который высвечивается в его профиле',
    })
    @Column({ type: DataType.STRING, allowNull: true })
    status: string;

    @ApiProperty({
        description:
            'Рейтинг пользователя, является суммой оценок, которые поставили его статьям другие пользователи',
    })
    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    rating: number;

    @ApiProperty({
        example: 'admin',
        description: 'Роль пользователя (admin, moderator, user)',
    })
    @Column({ type: DataType.STRING, defaultValue: 'user' })
    role: string;

    @ApiProperty({
        description:
            'Refresh токен пользователя, по которому происходит валидация пользователя и обновление access токена',
    })
    @HasOne(() => Token)
    refreshToken: Token;

    @ApiProperty({
        description: 'Пользовательские настройки (тема, feature flags и т.д.)',
    })
    @HasOne(() => UserSettings)
    settings: UserSettings;

    @ApiProperty({
        description: 'Статьи, опубликованные пользователем',
    })
    @HasMany(() => Article)
    articles: Article[];

    @ApiProperty({
        description: 'Оценки статей, поставленные данным пользователем',
    })
    @HasMany(() => ArticleRate)
    articleRates: ArticleRate[];

    @ApiProperty({
        description: 'Комментарии к статьям, оставленные данным пользователем',
    })
    @HasMany(() => CommentModel)
    comments: CommentModel[];

    @ApiProperty({
        description: 'Подписчики пользователя',
    })
    @HasMany(() => UserSubscriber, 'subscriptionId')
    subscribers: UserSubscriber[];

    @ApiProperty({
        description: 'Пользователи, на которых подписан данный пользователь',
    })
    @HasMany(() => UserSubscriber, 'subscriberId')
    subscriptions: UserSubscriber[];
}

@Table
export class UserSubscriber extends Model {
    @ForeignKey(() => User)
    @Column
    subscriberId: number;

    @BelongsTo(() => User, 'subscriberId')
    subscriber: User;

    @ForeignKey(() => User)
    @Column
    subscriptionId: number;

    @BelongsTo(() => User, 'subscriptionId')
    subscription: User;
}
