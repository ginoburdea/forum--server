import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Question } from '../questions/question.entity';
import { User } from '../auth/user.entity';

@Entity()
export class Answer extends BaseEntity {
    @Column() text: string;

    @OneToMany(() => Answer, (answer) => answer.replyingTo, {
        onDelete: 'CASCADE',
    })
    answers: Answer[];

    @ManyToOne(() => Answer, (answer) => answer.replyingTo)
    replyingTo: Answer | null;

    @ManyToOne(() => User, (user) => user.answers, { nullable: false })
    user: User;

    @ManyToOne(() => Question, (question) => question.answers, {
        nullable: false,
    })
    question: Question;
}
