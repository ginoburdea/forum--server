import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';

export interface NewAnswerJobData {
    questionId: string;
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
}
