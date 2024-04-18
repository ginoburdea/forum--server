import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { AuthModule } from '../auth/auth.module';
import { Question } from './question.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionGuard } from './question.guard';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Question])],
    controllers: [QuestionsController],
    providers: [QuestionsService, QuestionGuard],
    exports: [QuestionGuard],
})
export class QuestionsModule {}
