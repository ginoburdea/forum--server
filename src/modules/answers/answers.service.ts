import { Injectable } from '@nestjs/common';
import { Answer } from './answer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AnswersService {
    constructor(
        @InjectRepository(Answer)
        private readonly answersRepo: Repository<Answer>,
    ) {}

    async postAnswer(
        userId: string,
        questionId: string,
        answerText: string,
        parentAnswerId?: string,
    ) {
        const answer = await this.answersRepo
            .create({
                user: { id: userId },
                text: answerText,
                question: { id: questionId },
                replyingTo: { id: parentAnswerId },
            })
            .save();

        return {
            answerId: answer.id,
            replyingToId: answer.replyingTo.id || null,
        };
    }

    async findAnswer(answerId?: string) {
        if (!answerId) return null;

        return await this.answersRepo.findOne({
            where: { id: answerId },
            relations: { user: true },
        });
    }
}
