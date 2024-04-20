import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Session } from './session.entity';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';

@Entity()
export class User extends BaseEntity {
    @Column() name: string;
    @Column({ unique: true }) email: string;
    @Column() profilePhotoUrl: string;
    @Column({ default: true }) answersNotifications: boolean;
    @Column({ default: true }) repliesNotifications: boolean;

    @OneToMany(() => Session, (session) => session.user, {
        onDelete: 'CASCADE',
    })
    sessions: Session[];

    @OneToMany(() => Question, (question) => question.user, {
        onDelete: 'CASCADE',
    })
    questions: Question[];

    @OneToMany(() => Answer, (answer) => answer.user, {
        onDelete: 'CASCADE',
    })
    answers: Answer[];
}
