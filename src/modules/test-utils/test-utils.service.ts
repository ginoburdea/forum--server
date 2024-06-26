import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { faker } from '@faker-js/faker';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';
import { isDateString } from 'class-validator';
import clone from 'lodash.clone';
import isObject from 'lodash.isobject';
import { URL } from 'url';
import { OutgoingHttpHeaders } from 'http';

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

    /**
     * Recursively checks all the strings in the object input and turns them into Date objects if they are date strings (ISO8601).
     * @param input
     * @returns
     */
    parseDates = (input: any) => {
        if (Array.isArray(input)) {
            return input.map((inp) => this.parseDates(inp));
        }

        if (isObject(input)) {
            const copy = clone(input);
            for (const key in copy) copy[key] = this.parseDates(copy[key]);
            return copy;
        }

        if (typeof input === 'string' && isDateString(input)) {
            return new Date(input);
        }

        return input;
    };

    async emptyInbox() {
        await fetch('http://localhost:8025/api/v1/messages', {
            method: 'DELETE',
        });
    }

    headersToOAuthRes = (headers: OutgoingHttpHeaders) => {
        if (!headers.location) return;

        const url = new URL(headers.location);
        const rawAuthRes = url.searchParams.get('oAuthRes');
        if (!rawAuthRes) return;

        try {
            const authRes = JSON.parse(rawAuthRes);
            return authRes;
        } catch (err) {
            return;
        }
    };
}
