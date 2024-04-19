import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './answer.entity';
import { QuestionsModule } from '../questions/questions.module';
import { AuthModule } from '../auth/auth.module';
import { HelpersModule } from '../helpers/helpers.module';

@Module({
    imports: [
        AuthModule,
        QuestionsModule,
        HelpersModule,
        TypeOrmModule.forFeature([Answer]),
    ],
    controllers: [AnswersController],
    providers: [AnswersService],
    exports: [AnswersService],
})
export class AnswersModule {}
