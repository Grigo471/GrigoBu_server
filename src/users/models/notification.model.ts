import {
    BelongsTo,
    Column,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { User } from './users.model';

@Table
export class Notification extends Model {
    @Column
    type: string;

    @Column
    value: number;

    @Column
    name: string;

    @Column
    isSeen: boolean = false;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;
}
