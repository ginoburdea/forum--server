import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { AuthModule } from '../auth/auth.module';
import { Question } from './question.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersModule } from '../helpers/helpers.module';

@Module({
    imports: [AuthModule, HelpersModule, TypeOrmModule.forFeature([Question])],
    controllers: [QuestionsController],
    providers: [QuestionsService],
    exports: [QuestionsService],
})
export class QuestionsModule {}
