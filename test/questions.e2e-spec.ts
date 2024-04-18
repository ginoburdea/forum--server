import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { loadServer } from 'src/utils/loadServer';
import { faker } from '@faker-js/faker';
import { UnauthorizedHttpError } from 'src/dto/httpResponses';
import { TestUtilsService } from 'src/modules/test-utils/test-utils.service';
import {
    PostQuestionBody,
    PostQuestionRes,
} from 'src/modules/questions/dto/postQuestion.dto';

describe('Questions module v1 (e2e)', () => {
    let server: NestFastifyApplication;
    let testUtilsService: TestUtilsService;

    beforeAll(async () => {
        server = await loadServer(true);
        await server.init();
        await server.getHttpAdapter().getInstance().ready();

        testUtilsService = server.get<TestUtilsService>(TestUtilsService);
    });

    afterEach(async () => {
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
});
