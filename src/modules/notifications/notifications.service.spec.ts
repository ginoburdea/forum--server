import { NotificationsService } from './notifications.service';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { loadServer } from 'src/utils/loadServer';
import { TestUtilsService } from '../test-utils/test-utils.service';

describe('Notifications Service (integration)', () => {
    let server: NestFastifyApplication;
    let notificationsService: NotificationsService;
    let testUtilsService: TestUtilsService;

    beforeAll(async () => {
        server = await loadServer(true);
        await server.init();
        await server.getHttpAdapter().getInstance().ready();

        testUtilsService = server.get<TestUtilsService>(TestUtilsService);
        notificationsService =
            server.get<NotificationsService>(NotificationsService);
    });

    beforeEach(async () => {
        await testUtilsService.truncateTables();
        vi.restoreAllMocks();
        await testUtilsService.emptyInbox();
    });

    describe('#sendNewAnswerEmail()', () => {
        it('Should send an email to the author when someone answers his question', async () => {
            const questionAuthor = await testUtilsService.genUser();
            const question = await testUtilsService.genQuestion(questionAuthor);

            const answerAuthor = await testUtilsService.genUser();
            const answer = await testUtilsService.genAnswer(
                answerAuthor,
                question,
            );

            await notificationsService.sendNewAnswerEmail(
                answer.id,
                question.id,
            );

            const emailsRes = await fetch(
                `http://localhost:8025/api/v1/messages`,
            );
            const emailsBody = await emailsRes.json();
            expect(emailsBody.total).toEqual(1);
            expect(emailsBody.messages[0].To[0].Address).toEqual(
                questionAuthor.email,
            );
        });

        it('Should not send an email when the author answers his own question', async () => {
            const questionAuthor = await testUtilsService.genUser();
            const question = await testUtilsService.genQuestion(questionAuthor);

            const answerAuthor = questionAuthor;
            const answer = await testUtilsService.genAnswer(
                answerAuthor,
                question,
            );

            await notificationsService.sendNewAnswerEmail(
                answer.id,
                question.id,
            );

            const emailsRes = await fetch(
                `http://localhost:8025/api/v1/messages`,
            );
            const emailsBody = await emailsRes.json();
            expect(emailsBody.total).toEqual(0);
        });

        it('Should not send an email when the author is not subscribed to answer emails', async () => {
            const questionAuthor = await testUtilsService.genUser({
                answersNotifications: false,
            });
            const question = await testUtilsService.genQuestion(questionAuthor);

            const answerAuthor = await testUtilsService.genUser();
            const answer = await testUtilsService.genAnswer(
                answerAuthor,
                question,
            );

            await notificationsService.sendNewAnswerEmail(
                answer.id,
                question.id,
            );

            const emailsRes = await fetch(
                `http://localhost:8025/api/v1/messages`,
            );
            const emailsBody = await emailsRes.json();
            expect(emailsBody.total).toEqual(0);
        });
    });
});
