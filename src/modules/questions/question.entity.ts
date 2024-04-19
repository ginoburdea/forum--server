import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../auth/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Answer } from '../answers/answer.entity';

@Entity()
export class Question extends BaseEntity {
    @Column() text: string;
    @Column({ nullable: true }) closedAt?: Date;

    @ManyToOne(() => User, (user) => user.sessions) user: User;

    @OneToMany(() => Answer, (answer) => answer.question, {
        onDelete: 'CASCADE',
    })
    answers: Answer[];
}
