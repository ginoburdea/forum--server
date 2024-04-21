import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { loadServer } from 'src/utils/loadServer';
import { faker } from '@faker-js/faker';
import {
    GoogleAuthBody,
    GoogleAuthRes,
} from 'src/modules/auth/dto/googleAuth.dto';
import { TestUtilsService } from 'src/modules/test-utils/test-utils.service';
import { UnauthorizedHttpError } from 'src/dto/httpResponses.dto';
import { OAuth2Client } from 'google-auth-library';
import { GetProfileRes } from 'src/modules/auth/dto/getProfile.dto';

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

    describe('Get profile info about himself (GET /v1/auth/profile)', () => {
        const method = 'GET';
        const url = '/v1/auth/profile';

        it('Should get the profile info', async () => {
            const authHeaders = await testUtilsService.genAuthHeaders();

            const res = await server.inject({
                method,
                url,
                headers: authHeaders,
            });
            const body: GetProfileRes = res.json();

            expect(body).toMatchSchema(GetProfileRes);
            expect(res.statusCode).toEqual(200);
        });

        it('Should return unauthorized error when the user is not logged in', async () => {
            const authHeaders = { authorization: '' };

            const res = await server.inject({
                method,
                url,
                headers: authHeaders,
            });
            const body = res.json();

            expect(body).toMatchSchema(UnauthorizedHttpError);
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('Update own profile info (PATCH /v1/auth/profile)', () => {
        const method = 'PATCH';
        const url = '/v1/auth/profile';

        it('Should update the profile info', async () => {
            const authHeaders = await testUtilsService.genAuthHeaders();
            const updatedInfo = {
                name: faker.helpers.maybe(() => faker.person.fullName()),
                answersNotifications: faker.helpers.maybe(() =>
                    faker.helpers.arrayElement([true, false]),
                ),
                repliesNotifications: faker.helpers.maybe(() =>
                    faker.helpers.arrayElement([true, false]),
                ),
            };

            const res = await server.inject({
                method,
                url,
                body: updatedInfo,
                headers: authHeaders,
            });

            expect(res.body).toEqual('');
            expect(res.statusCode).toEqual(204);
        });

        it('Should return unauthorized error when the user is not logged in', async () => {
            const authHeaders = { authorization: '' };
            const updatedInfo = {
                name: faker.helpers.maybe(() => faker.person.fullName()),
                answersNotifications: faker.helpers.maybe(() =>
                    faker.helpers.arrayElement([true, false]),
                ),
                repliesNotifications: faker.helpers.maybe(() =>
                    faker.helpers.arrayElement([true, false]),
                ),
            };
            const res = await server.inject({
                method,
                url,
                body: updatedInfo,
                headers: authHeaders,
            });
            const body = res.json();

            expect(body).toMatchSchema(UnauthorizedHttpError);
            expect(res.statusCode).toEqual(401);
        });
    });
});
