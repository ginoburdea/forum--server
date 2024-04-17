import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuestionsService {
    constructor(
        @InjectRepository(Question)
        private readonly questionsRepo: Repository<Question>,
    ) {}

    async postQuestion(userId: string, question: string) {
        const createdQuestion = await this.questionsRepo
            .create({ text: question, user: { id: userId } })
            .save();
        return { questionId: createdQuestion.id };
    }
}
