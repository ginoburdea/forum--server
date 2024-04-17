import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { loadServer } from 'src/utils/loadServer';
import { AuthService } from 'src/modules/auth/auth.service';
import { faker } from '@faker-js/faker';
import { GoogleAuthBody, GoogleAuthRes } from 'src/modules/auth/dto/googleAuth';
import { UnauthorizedHttpError } from 'src/dto/httpResponses';
import { TestUtilsService } from 'src/modules/test-utils/test-utils.service';

describe('Auth module v1 (e2e)', () => {
    let server: NestFastifyApplication;
    let authService: AuthService;
    let testUtilsService: TestUtilsService;

    beforeAll(async () => {
        server = await loadServer(true);
        await server.init();
        await server.getHttpAdapter().getInstance().ready();

        authService = server.get<AuthService>(AuthService);
        testUtilsService = server.get<TestUtilsService>(TestUtilsService);
    });

    afterEach(async () => {
        await testUtilsService.truncateTables();
    });

    describe('Authenticate with Google (POST /v1/auth/google)', () => {
        const method = 'POST';
        const url = '/v1/auth/google';

        it('Should register a user when the Google id token is valid', async () => {
            vi.spyOn(authService, 'idTokenToUserData').mockImplementationOnce(
                async () => ({
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    profilePhotoUrl: faker.image.avatar(),
                }),
            );
            const inputBody: GoogleAuthBody = {
                idToken: faker.string.nanoid(16),
            };

            const res = await server.inject({ method, url, body: inputBody });
            const body = res.json();

            expect(res.statusCode).toEqual(200);
            expect(body).toMatchSchema(GoogleAuthRes);
        });

        it('Should log in a user when the Google id token is valid', async () => {
            vi.spyOn(authService, 'idTokenToUserData').mockImplementationOnce(
                async () => ({
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    profilePhotoUrl: faker.image.avatar(),
                }),
            );
            const inputBody: GoogleAuthBody = {
                idToken: faker.string.nanoid(16),
            };
            vi.spyOn(authService, 'idTokenToUserData').mockImplementationOnce(
                async () => ({
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    profilePhotoUrl: faker.image.avatar(),
                }),
            );
            await server.inject({ method, url, body: inputBody });

            const res = await server.inject({ method, url, body: inputBody });
            const body = res.json();

            expect(res.statusCode).toEqual(200);
            expect(body).toMatchSchema(GoogleAuthRes);
        });

        it('Should return a unauthorized error when the Google id token is invalid', async () => {
            const inputBody: GoogleAuthBody = {
                idToken: faker.string.nanoid(16),
            };

            const res = await server.inject({ method, url, body: inputBody });
            const body = res.json();

            expect(res.statusCode).toEqual(401);
            expect(body).toMatchSchema(UnauthorizedHttpError);
        });

        it('Should return a validation error when the body data is invalid', async () => {
            const inputBody = {};

            const res = await server.inject({ method, url, body: inputBody });
            const body = res.json();

            expect(res.statusCode).toEqual(422);
            expect(body).toHaveValidationErrors(['idToken']);
        });
    });
});
