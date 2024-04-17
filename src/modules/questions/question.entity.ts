import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../auth/user.entity';
import { BaseEntity } from 'src/utils/base.entity';

@Entity()
export class Question extends BaseEntity {
    @Column() text: string;
    @Column({ nullable: true }) closedAt?: Date;

    @ManyToOne(() => User, (user) => user.sessions) user: User;
}
