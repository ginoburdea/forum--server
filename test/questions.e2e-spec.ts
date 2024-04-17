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
});
