import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { faker } from '@faker-js/faker';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';

@Injectable()
export class TestUtilsService {
    constructor(
        public dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Question)
        private readonly questionRepo: Repository<Question>,
        @InjectRepository(Answer)
        private readonly answersRepo: Repository<Answer>,
        private readonly authService: AuthService,
    ) {}

    async truncateTables() {
        const tableNames = this.dataSource.entityMetadatas
            .map((entity) => entity.tableName)
            .reduce(
                (acc, curr) =>
                    acc.indexOf(curr) !== -1 ? acc : [...acc, curr],
                [],
            )
            .map((tableName) => `"${tableName}"`)
            .join(', ');

        await this.dataSource.query(`TRUNCATE ${tableNames} CASCADE`);
    }

    async genUser(overrides: Partial<User> = {}) {
        return this.userRepo
            .create({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                profilePhotoUrl: faker.image.avatar(),
                ...overrides,
            })
            .save();
    }

    async genAuthHeaders(user?: User) {
        const _user = user || (await this.genUser());
        const session = await this.authService.genAuthInfo(_user.id);
        return { authorization: 'Bearer ' + session.token };
    }

    async genQuestion(user: User, overrides: Partial<Question> = {}) {
        return this.questionRepo
            .create({
                text: faker.lorem.sentence(),
                closedAt: faker.date.recent(),
                user,
                ...overrides,
            })
            .save();
    }

    async genQuestionsWithAnswers(
        count: number = faker.number.int({ min: 2, max: 5 }),
        user?: User,
    ) {
        const _user = user ?? (await this.genUser());

        const questions: Question[] = [];
        for (let i = 0; i < count; i++) {
            const question = await this.genQuestion(_user);
            await this.genAnswers(_user, question);

            questions.push(question);
        }

        return questions;
    }

    async genAnswer(
        user: User,
        question?: Question,
        overrides: Partial<Answer> = {},
    ) {
        return this.answersRepo
            .create({
                text: faker.lorem.sentence(),
                replyingTo: null,
                user,
                question: question ?? (await this.genQuestion(user)),
                ...overrides,
            })
            .save();
    }

    async genAnswers(
        user: User,
        question: Question,
        count: number = faker.number.int({ min: 2, max: 5 }),
    ) {
        const _user = user ?? (await this.genUser());

        const answers: Answer[] = [];
        for (let i = 0; i < count; i++) {
            const answer = await this.genAnswer(_user, question);
            answers.push(answer);
        }

        return answers;
    }
}
