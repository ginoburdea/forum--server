import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { loadServer } from 'src/utils/loadServer';
import { faker } from '@faker-js/faker';
import { GoogleAuthBody, GoogleAuthRes } from 'src/modules/auth/dto/googleAuth';
import { TestUtilsService } from 'src/modules/test-utils/test-utils.service';
import { UnauthorizedHttpError } from 'src/dto/httpResponses';
import { OAuth2Client } from 'google-auth-library';

const mockGoogleAuth = () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockImplementation(
        vi.fn(async () => ({
            getPayload: vi.fn(() => ({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                picture: faker.image.avatar(),
            })),
        })),
    );
};

describe('Auth module v1 (e2e)', () => {
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

    describe('Authenticate with Google (POST /v1/auth/google)', () => {
        const method = 'POST';
        const url = '/v1/auth/google';

        it('Should register a user when the Google id token is valid', async () => {
            mockGoogleAuth();
            const inputBody: GoogleAuthBody = {
                idToken: faker.string.nanoid(16),
            };
            const res = await server.inject({
                method,
                url,
                body: inputBody,
            });
            const body = res.json();

            expect(body).toMatchSchema(GoogleAuthRes);
            expect(res.statusCode).toEqual(200);
        });

        it('Should log in a user when the Google id token is valid', async () => {
            mockGoogleAuth();
            const inputBody: GoogleAuthBody = {
                idToken: faker.string.nanoid(16),
            };
            await server.inject({ method, url, body: inputBody });

            const res = await server.inject({
                method,
                url,
                body: inputBody,
            });
            const body = res.json();

            expect(body).toMatchSchema(GoogleAuthRes);
            expect(res.statusCode).toEqual(200);
        });

        it('Should return a unauthorized error when the Google id token is invalid', async () => {
            const inputBody: GoogleAuthBody = {
                idToken: faker.string.nanoid(16),
            };

            const res = await server.inject({ method, url, body: inputBody });
            const body = res.json();

            expect(body).toMatchSchema(UnauthorizedHttpError);
            expect(res.statusCode).toEqual(401);
        });

        it('Should return a validation error when the body data is invalid', async () => {
            const inputBody = {};

            const res = await server.inject({ method, url, body: inputBody });
            const body = res.json();

            expect(body).toHaveValidationErrors(['idToken']);
            expect(res.statusCode).toEqual(422);
        });
    });
});
