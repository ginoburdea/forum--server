import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnswersService } from '../answers/answers.service';
import { QuestionsService } from '../questions/questions.service';
import { compile } from 'handlebars';

@Injectable()
export class NotificationsService {
    private templates: {
        [key: string]: { [key: string]: HandlebarsTemplateDelegate<any> };
    } = {};

    constructor(
        private readonly answersService: AnswersService,
        private readonly questionsService: QuestionsService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {
        this.templates = {
            newAnswer: {
                answerUrl: compile(
                    configService.get<string>('LINKS__NEW_ANSWER__ANSWER_URL'),
                ),
            },
            newReply: {
                answerUrl: compile(
                    configService.get<string>('LINKS__NEW_REPLY__ANSWER_URL'),
                ),
            },
        };
    }

    shortenText(text: string, maxLength: number) {
        return text.length < maxLength
            ? text.slice(0, maxLength) + '...'
            : text;
    }

    replaceValuesInLinks(link: string, values: { [key: string]: any }) {
        let result = link;

        for (const key in values) {
            result = result.replace(':' + key, values[key]);
        }

        return result;
    }

    async sendNewAnswerEmail(answerId: string, questionId: string) {
        const question = await this.questionsService.findQuestion(questionId);
        if (!question.user.answersNotifications) return;

        const answer = await this.answersService.findAnswer(answerId);
        if (question.user.id === answer.user.id) return;

        const answerUrl = this.templates.newAnswer.answerUrl({
            answerId,
            questionId,
        });
        const questionPreviewText = this.shortenText(
            question.text,
            this.configService.get<number>('QUESTION_PREVIEW_LENGTH'),
        );

        await this.mailerService.sendMail({
            to: question.user.email,
            subject: 'Someone answered your question!',
            template: 'newAnswer',
            context: {
                answerAuthorName: answer.user.name,
                answerUrl,
                questionPreviewText,
            },
        });
    }

    async sendNewReplyEmail(replyingToAnswerId: string, answerId: string) {
        const answer = await this.answersService.findAnswer(
            replyingToAnswerId,
            ['user', 'question'],
        );
        if (!answer.user.repliesNotifications) return;

        const reply = await this.answersService.findAnswer(answerId);
        if (answer.user.id === reply.user.id) return;

        const answerUrl = this.templates.newReply.answerUrl({
            answerId,
            questionId: answer.question.id,
            repliedToAnswerId: replyingToAnswerId,
        });
        const answerPreviewText = this.shortenText(
            answer.question.text,
            this.configService.get<number>('OWN_ANSWER_PREVIEW_LENGTH'),
        );

        await this.mailerService.sendMail({
            to: answer.user.email,
            subject: 'Someone replied to your answer!',
            template: 'newReply',
            context: {
                answerAuthorName: answer.user.name,
                answerUrl,
                answerPreviewText,
            },
        });
    }
}
