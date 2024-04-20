import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { loadServer } from 'src/utils/loadServer';
import { faker } from '@faker-js/faker';
import {
    BadRequestHttpError,
    UnauthorizedHttpError,
    UnprocessableEntityHttpError,
} from 'src/dto/httpResponses.dto';
import { TestUtilsService } from 'src/modules/test-utils/test-utils.service';
import {
    PostAnswerBody,
    PostAnswerRes,
} from 'src/modules/answers/dto/postAnswer.dto';

describe('Answers module v1 (e2e)', () => {
    let server: NestFastifyApplication;
    let testUtilsService: TestUtilsService;

    beforeAll(async () => {
        server = await loadServer(true);
        await server.init();
        await server.getHttpAdapter().getInstance().ready();

        testUtilsService = server.get<TestUtilsService>(TestUtilsService);
    });

    beforeEach(async () => {
        await testUtilsService.truncateTables();
        vi.restoreAllMocks();
    });

    describe('Post an answer (POST /v1/questions/:questionId/answers)', () => {
        const method = 'POST';
        const url = '/v1/questions/:questionId/answers';

        it('Should post an answer', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);
            const question = await testUtilsService.genQuestion(user, {
                closedAt: null,
            });
            const _url = url.replace(':questionId', question.id);
            const inputBody: PostAnswerBody = {
                text: faker.lorem.sentence(),
            };

            const res = await server.inject({
                method,
                url: _url,
                body: inputBody,
                headers: authHeaders,
            });
            const body: PostAnswerRes = res.json();

            expect(body).toMatchSchema(PostAnswerRes);
            expect(body.replyingToId).toBeNull();
            expect(res.statusCode).toEqual(200);
        });

        it('Should post an answer replying to another answer', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);
            const question = await testUtilsService.genQuestion(user, {
                closedAt: null,
            });
            const answer = await testUtilsService.genAnswer(user);

            const _url = url.replace(':questionId', question.id);
            const inputBody: PostAnswerBody = {
                text: faker.lorem.sentence(),
                replyingTo: answer.id,
            };

            const res = await server.inject({
                method,
                url: _url,
                body: inputBody,
                headers: authHeaders,
            });
            const body: PostAnswerRes = res.json();

            expect(body).toMatchSchema(PostAnswerRes);
            expect(body.replyingToId).toBeTypeOf('string');
            expect(res.statusCode).toEqual(200);
        });

        it('Should return a bad request error when trying answer a closed question', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);
            const question = await testUtilsService.genQuestion(user, {
                closedAt: faker.date.past(),
            });
            const _url = url.replace(':questionId', question.id);
            const inputBody: PostAnswerBody = {
                text: faker.lorem.sentence(),
            };

            const res = await server.inject({
                method,
                url: _url,
                body: inputBody,
                headers: authHeaders,
            });
            const body: BadRequestHttpError = res.json();

            expect(body).toHaveValidationErrors(['questionId']);
            expect(res.statusCode).toEqual(400);
        });

        it('Should return unauthorized error when the user is not logged in', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = { authorization: '' };
            const question = await testUtilsService.genQuestion(user);

            const _url = url.replace(':questionId', question.id);
            const inputBody = {};

            const res = await server.inject({
                method,
                url: _url,
                body: inputBody,
                headers: authHeaders,
            });
            const body: UnauthorizedHttpError = res.json();

            expect(body).toMatchSchema(UnauthorizedHttpError);
            expect(res.statusCode).toEqual(401);
        });

        it('Should return a validation error when the body data is invalid', async () => {
            const user = await testUtilsService.genUser();
            const authHeaders = await testUtilsService.genAuthHeaders(user);
            const question = await testUtilsService.genQuestion(user);

            const _url = url.replace(':questionId', question.id);
            const inputBody = {};

            const res = await server.inject({
                method,
                url: _url,
                body: inputBody,
                headers: authHeaders,
            });
            const body: UnprocessableEntityHttpError = res.json();

            expect(body).toHaveValidationErrors(['text']);
            expect(res.statusCode).toEqual(422);
        });
    });
});
