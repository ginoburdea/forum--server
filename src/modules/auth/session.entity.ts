import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Session extends BaseEntity {
    @Column() token: string;
    @Column() expiresAt: Date;

    @ManyToOne(() => User, (user) => user.sessions) user: User;
}
