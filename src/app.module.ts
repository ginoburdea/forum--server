import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/database';
import { configConfig } from './config/config';
import { QuestionsModule } from './modules/questions/questions.module';
import { AnswersModule } from './modules/answers/answers.module';
import { BullModule } from '@nestjs/bull';
import { bullConfig } from './config/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { mailerConfig } from './config/mailer';

@Module({
    imports: [
        ConfigModule.forRoot(configConfig),
        TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true }),
        BullModule.forRootAsync(bullConfig),
        MailerModule.forRootAsync(mailerConfig),
        AuthModule,
        QuestionsModule,
        AnswersModule,
        NotificationsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
