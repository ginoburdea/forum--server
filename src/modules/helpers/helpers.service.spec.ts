import {
    HelperError,
    HelperErrorCode,
    HelpersService,
} from './helpers.service';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { TestUtilsService } from '../test-utils/test-utils.service';
import { loadServer } from 'src/utils/loadServer';
import { Question } from '../questions/question.entity';

describe('HelpersService tests', () => {
    let helpersService: HelpersService;
    let server: NestFastifyApplication;
    let testUtilsService: TestUtilsService;

    beforeAll(async () => {
        server = await loadServer(true);
        await server.init();
        await server.getHttpAdapter().getInstance().ready();

        testUtilsService = server.get<TestUtilsService>(TestUtilsService);
        helpersService = server.get<HelpersService>(HelpersService);
    });

    afterEach(async () => {
        await testUtilsService.truncateTables();
        vi.restoreAllMocks();
    });

    describe('extractEntityId function', () => {
        it('Should extract the entity id from the request', () => {
            const location = faker.helpers.arrayElement([
                'params',
                'body',
                'query',
            ]) as 'params' | 'body' | 'query';
            const key = faker.lorem.word();
            const mergedLocation = `${location}.${key}`;

            const entityId = faker.lorem.word();
            const req = { params: {}, body: {}, query: {} };
            req[location] = { [key]: entityId };

            const res = helpersService.extractEntityId(req, mergedLocation);

            expect(res.key).toEqual(key);
            expect(res.entityId).toEqual(entityId);
        });

        it('Should return undefined when the entity id was not found on the request', () => {
            const location = faker.helpers.arrayElement([
                'params',
                'body',
                'query',
            ]) as 'params' | 'body' | 'query';
            const key = faker.lorem.word();
            const mergedLocation = `${location}.${key}`;

            const reqWithoutEntityId = { params: {}, body: {}, query: {} };

            const res = helpersService.extractEntityId(
                reqWithoutEntityId,
                mergedLocation,
            );

            expect(res.key).toEqual(key);
            expect(res.entityId).toBeUndefined();
        });

        it('Should throw an error when the location part is invalid', () => {
            const invalidLocation = faker.lorem.word();
            const key = faker.lorem.word();
            const mergedLocation = `${invalidLocation}.${key}`;
            const req = { params: {}, body: {}, query: {} };

            let foundError = false;
            try {
                helpersService.extractEntityId(req, mergedLocation);
            } catch (error) {
                expect(error).toBeInstanceOf(HelperError);
                expect(error).toHaveProperty(
                    'code',
                    HelperErrorCode.INVALID_LOCATION,
                );
                foundError = true;
            }
            expect(foundError).toBeTruthy();
        });
    });

    describe('handleParam function', () => {
        it('Should return the entity when it exists, the user must own it, and he owns it', async () => {
            const user = await testUtilsService.genUser();
            const question = await testUtilsService.genQuestion(user);
            const key = faker.lorem.word();

            const res = await helpersService.handleParam(
                question.id,
                key,
                Question,
                true,
                user.id,
            );

            expect(res.entity).toBeInstanceOf(Question);
        });

        it("Should return the entity when it exists, the user must doesn't have to own it, but he owns it", async () => {
            const user = await testUtilsService.genUser();
            const question = await testUtilsService.genQuestion(user);
            const key = faker.lorem.word();

            const res = await helpersService.handleParam(
                question.id,
                key,
                Question,
                false,
                user.id,
            );

            expect(res.entity).toBeInstanceOf(Question);
        });

        it('Should throw an error when the entity id is not a valid UUID', async () => {
            const user = await testUtilsService.genUser();
            const invalidQuestionId = faker.string.nanoid(16);
            const key = faker.lorem.word();

            let foundError = false;
            try {
                await helpersService.handleParam(
                    invalidQuestionId,
                    key,
                    Question,
                    true,
                    user.id,
                );
            } catch (error) {
                expect(error).toBeInstanceOf(HelperError);
                expect(error).toHaveProperty(
                    'code',
                    HelperErrorCode.ENTITY_NOT_FOUND,
                );
                expect(error).toHaveProperty(`description.${key}`);
                foundError = true;
            }
            expect(foundError).toBeTruthy();
        });

        it('Should throw an error when the entity is not found', async () => {
            const user = await testUtilsService.genUser();
            const nonExistingId = faker.string.uuid();
            const key = faker.lorem.word();

            let foundError = false;
            try {
                await helpersService.handleParam(
                    nonExistingId,
                    key,
                    Question,
                    true,
                    user.id,
                );
            } catch (error) {
                expect(error).toBeInstanceOf(HelperError);
                expect(error).toHaveProperty(
                    'code',
                    HelperErrorCode.ENTITY_NOT_FOUND,
                );
                expect(error).toHaveProperty(`description.${key}`);
                foundError = true;
            }
            expect(foundError).toBeTruthy();
        });

        it("Should throw an error when the user must own the model but he doesn't own it", async () => {
            const user = await testUtilsService.genUser();
            const question = await testUtilsService.genQuestion(user);
            const anotherUser = await testUtilsService.genUser();
            const key = faker.lorem.word();

            let foundError = false;
            try {
                await helpersService.handleParam(
                    question.id,
                    key,
                    Question,
                    true,
                    anotherUser.id,
                );
            } catch (error) {
                expect(error).toBeInstanceOf(HelperError);
                expect(error).toHaveProperty(
                    'code',
                    HelperErrorCode.NOT_ENOUGH_PERMISSIONS,
                );
                foundError = true;
            }
            expect(foundError).toBeTruthy();
        });
    });
});
