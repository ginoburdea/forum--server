import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsConsumer } from './notifications.consumer';
import { AnswersModule } from '../answers/answers.module';
import { QuestionsModule } from '../questions/questions.module';

@Module({
    imports: [NotificationsModule, AnswersModule, QuestionsModule],
    providers: [NotificationsService, NotificationsConsumer],
})
export class NotificationsModule {}
