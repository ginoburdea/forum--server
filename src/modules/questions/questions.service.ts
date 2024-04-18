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

    async findQuestion(questionId?: string) {
        if (!questionId) return null;

        return await this.questionsRepo.findOne({
            where: { id: questionId },
            relations: { user: true },
        });
    }

    async closeQuestion(questionId: string) {
        await this.questionsRepo.update(
            { id: questionId, closedAt: null },
            { closedAt: new Date() },
        );
    }
}
