import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';

export interface NewAnswerJobData {
    questionId: string;
    answerId: string;
}

export interface NewReplyJobData {
    replyingToAnswerId: string;
    answerId: string;
}

@Processor('notifications')
export class NotificationsConsumer {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Process('newAnswer')
    async processNewAnswer(job: Job<NewAnswerJobData>) {
        await this.notificationsService.sendNewAnswerEmail(
            job.data.answerId,
            job.data.questionId,
        );
    }

    @Process('newReply')
    async processNewReply(job: Job<NewReplyJobData>) {
        await this.notificationsService.sendNewReplyEmail(
            job.data.replyingToAnswerId,
            job.data.answerId,
        );
    }
}
