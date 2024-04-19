import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { loadServer } from 'src/utils/loadServer';
import { faker } from '@faker-js/faker';
import { UnauthorizedHttpError } from 'src/dto/httpResponses';
import { TestUtilsService } from 'src/modules/test-utils/test-utils.service';
import {
    PostQuestionBody,
    PostQuestionRes,
} from 'src/modules/questions/dto/postQuestion.dto';
import {
    GetQuestionsRes,
    QuestionsSortOptions,
} from 'src/modules/questions/dto/getQuestions.dto';
import { ConfigService } from '@nestjs/config';
import { isDateString } from 'class-validator';
import clone from 'lodash.clone';
import isObject from 'lodash.isobject';

/**
 * Recursively checks all the strings in the object input and turns them into Date objects if they are date strings (ISO8601).
 * @param input
 * @returns
 */
const parseDates = (input: any) => {
    if (Array.isArray(input)) {
        return input.map((inp) => parseDates(inp));
    }

    if (isObject(input)) {
        const copy = clone(input);
        for (const key in copy) copy[key] = parseDates(copy[key]);
        return copy;
    }

    if (typeof input === 'string' && isDateString(input)) {
        return new Date(input);
    }

    return input;
};

describe('Questions module v1 (e2e)', () => {
    let server: NestFastifyApplication;
    let testUtilsService: TestUtilsService;
    let configService: ConfigService;

    beforeAll(async () => {
        server = await loadServer(true);
        await server.init();
        await server.getHttpAdapter().getInstance().ready();

        testUtilsService = server.get<TestUtilsService>(TestUtilsService);
        configService = server.get<ConfigService>(ConfigService);
    });

    beforeEach(async () => {
        await testUtilsService.truncateTables();
        vi.restoreAllMocks();
    });

    describe('Post a question (POST /v1/questions)', () => {
        const method = 'POST';
        const url = '/v1/questions';

        it('Should post a question', async () => {
            const authHeaders = await testUtilsService.genAuthHeaders();
            const inputBody: PostQuestionBody = {
                question: faker.lorem.sentences(3),
            };

            const res = await server.inject({
                method,
                url,
                body: inputBody,
                headers: authHeaders,
            });
            const body = res.json();

            expect(body).toMatchSchema(PostQuestionRes);
            expect(res.statusCode).toEqual(200);
        });

        it('Should return unauthorized error when the user is not logged in', async () => {
            const authHeaders = { authorization: '' };
            const inputBody: PostQuestionBody = {
                question: faker.lorem.sentences(3),
            };

            const res = await server.inject({
                method,
                url,
                body: inputBody,
                headers: authHeaders,
            });
            const body = res.json();

            expect(body).toMatchSchema(UnauthorizedHttpError);
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Close a question (PUT /v1/questions/:questionId/close)', () => {
        const method = 'PUT';
        const url = '/v1/questions/:questionId/close';

        it('Should close a question', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);
            const question = await testUtilsService.genQuestion(user);
            const _url = url.replace(':questionId', question.id);

            const res = await server.inject({
                method,
                url: _url,
                headers: authHeaders,
            });

            expect(res.body).toEqual('');
            expect(res.statusCode).toEqual(204);
        });

        it('Should return unauthorized error when the user is not logged in', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = { authorization: '' };
            const question = await testUtilsService.genQuestion(user);
            const _url = url.replace(':questionId', question.id);

            const res = await server.inject({
                method,
                url: _url,
                headers: authHeaders,
            });
            const body = res.json();

            expect(body).toMatchSchema(UnauthorizedHttpError);
            expect(res.statusCode).toEqual(401);
        });

        it("Should return forbidden error when the user tries to close someone else's question", async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);

            const someoneElse = await testUtilsService.genUser();
            const someoneElsesQuestion =
                await testUtilsService.genQuestion(someoneElse);
            const _url = url.replace(':questionId', someoneElsesQuestion.id);

            const res = await server.inject({
                method,
                url: _url,
                headers: authHeaders,
            });
            const body = res.json();

            expect(body).toMatchSchema(UnauthorizedHttpError);
            expect(res.statusCode).toEqual(403);
        });

        it('Should return bad request error when the question does not exist', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);
            const notExistentQuestionId = faker.string.uuid();
            const _url = url.replace(':questionId', notExistentQuestionId);

            const res = await server.inject({
                method,
                url: _url,
                headers: authHeaders,
            });
            const body = res.json();

            expect(body).toHaveValidationErrors(['questionId']);
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('List questions (GET /v1/questions)', () => {
        const method = 'GET';
        const url = '/v1/questions';

        it('Should list questions on the first page', async () => {
            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize + 1);

            const query = { page: '0', sort: QuestionsSortOptions.NEWEST };
            const res = await server.inject({ method, url, query });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
        });

        it('Should list questions on the second page', async () => {
            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize + 1);

            const query = { page: '1', sort: QuestionsSortOptions.NEWEST };
            const res = await server.inject({ method, url, query });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(1);
        });

        it('Should list questions when sorted by newest', async () => {
            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize);

            const query = { page: '0', sort: QuestionsSortOptions.NEWEST };
            const res = await server.inject({ method, url, query });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
            expect(parseDates(body.questions)).toBeSorted({
                byKey: 'postedAt',
                order: 'desc',
            });
        });

        it('Should list questions when sorted by oldest', async () => {
            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize);

            const query = { page: '0', sort: QuestionsSortOptions.NEWEST };
            const res = await server.inject({ method, url, query });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
            expect(parseDates(body.questions)).toBeSorted({
                byKey: 'postedAt',
                order: 'asc',
            });
        });

        it('Should list questions when sorted by most answered', async () => {
            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize);

            const query = {
                page: '0',
                sort: QuestionsSortOptions.MOST_ANSWERED,
            };
            const res = await server.inject({ method, url, query });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
            expect(body.questions).toBeSorted({
                byKey: 'answers',
                order: 'desc',
            });
        });

        it('Should list questions when sorted by least answered', async () => {
            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize);

            const query = {
                page: '0',
                sort: QuestionsSortOptions.LEAST_ANSWERED,
            };
            const res = await server.inject({ method, url, query });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
            expect(body.questions).toBeSorted({
                byKey: 'answers',
                order: 'asc',
            });
        });
    });

    describe('List own questions (GET /v1/questions/own)', () => {
        const method = 'GET';
        const url = '/v1/questions/own';

        it('Should list own questions on the first page', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);

            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize + 1, user);

            const query = { page: '0', sort: QuestionsSortOptions.NEWEST };
            const res = await server.inject({
                method,
                url,
                query,
                headers: authHeaders,
            });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);

            for (const question of body.questions) {
                expect(question).toMatchObject({
                    authorName: user.name,
                    authorPhoto: user.profilePhotoUrl,
                });
            }
        });

        it('Should list own questions on the second page', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);

            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize + 1, user);

            const query = { page: '1', sort: QuestionsSortOptions.NEWEST };
            const res = await server.inject({
                method,
                url,
                query,
                headers: authHeaders,
            });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(1);
        });

        it('Should list own questions when sorted by newest', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);

            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize, user);

            const query = { page: '0', sort: QuestionsSortOptions.NEWEST };
            const res = await server.inject({
                method,
                url,
                query,
                headers: authHeaders,
            });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
            expect(parseDates(body.questions)).toBeSorted({
                byKey: 'postedAt',
                order: 'desc',
            });
        });

        it('Should list own questions when sorted by oldest', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);

            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize, user);

            const query = { page: '0', sort: QuestionsSortOptions.NEWEST };
            const res = await server.inject({
                method,
                url,
                query,
                headers: authHeaders,
            });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
            expect(parseDates(body.questions)).toBeSorted({
                byKey: 'postedAt',
                order: 'asc',
            });
        });

        it('Should list own questions when sorted by most answered', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);

            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize, user);

            const query = {
                page: '0',
                sort: QuestionsSortOptions.MOST_ANSWERED,
            };
            const res = await server.inject({
                method,
                url,
                query,
                headers: authHeaders,
            });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
            expect(body.questions).toBeSorted({
                byKey: 'answers',
                order: 'desc',
            });
        });

        it('Should list own questions when sorted by least answered', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);

            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize, user);

            const query = {
                page: '0',
                sort: QuestionsSortOptions.LEAST_ANSWERED,
            };
            const res = await server.inject({
                method,
                url,
                query,
                headers: authHeaders,
            });
            const body: GetQuestionsRes = res.json();

            expect(body).toMatchSchema(GetQuestionsRes);
            expect(res.statusCode).toEqual(200);
            expect(body.questions).toHaveLength(pageSize);
            expect(body.questions).toBeSorted({
                byKey: 'answers',
                order: 'asc',
            });
        });

        it('Should not list own questions when user is not logged in', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = { authorization: '' };

            const pageSize = configService.get<number>('PAGE_SIZE');
            await testUtilsService.genQuestionsWithAnswers(pageSize, user);

            const query = {
                page: '0',
                sort: QuestionsSortOptions.NEWEST,
            };
            const res = await server.inject({
                method,
                url,
                query,
                headers: authHeaders,
            });
            const body: UnauthorizedHttpError = res.json();

            expect(body).toMatchSchema(UnauthorizedHttpError);
            expect(res.statusCode).toEqual(401);
        });
    });
});
