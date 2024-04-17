import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Session } from './session.entity';
import { Question } from '../questions/question.entity';

@Entity()
export class User extends BaseEntity {
    @Column() name: string;
    @Column({ unique: true }) email: string;
    @Column() profilePhotoUrl: string;

    @OneToMany(() => Session, (session) => session.user, {
        onDelete: 'CASCADE',
    })
    sessions: Session[];

    @OneToMany(() => Question, (question) => question.user, {
        onDelete: 'CASCADE',
    })
    questions: Question[];
}
