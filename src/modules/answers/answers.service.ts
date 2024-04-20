import { Injectable } from '@nestjs/common';
import { Answer } from './answer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswersSortOptions, ListedAnswer } from './dto/getAnswers.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnswersService {
    constructor(
        @InjectRepository(Answer)
        private readonly answersRepo: Repository<Answer>,
        private readonly config: ConfigService,
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

    convertSortOption(option: AnswersSortOptions) {
        const dict: {
            [key in AnswersSortOptions]: [
                field: string,
                ascOrDesc: 'ASC' | 'DESC',
            ];
        } = {
            [AnswersSortOptions.NEWEST]: ['createdAt', 'DESC'],
            [AnswersSortOptions.OLDEST]: ['createdAt', 'ASC'],
        };
        return dict[option];
    }

    async getAnswers(
        page: number,
        sortByField: 'createdAt',
        sortAscOrDesc: 'ASC' | 'DESC',
    ): Promise<ListedAnswer[]> {
        const pageSize = this.config.get<number>('PAGE_SIZE');

        const answerSelectFields = {
            id: true,
            createdAt: true,
            text: true,
            user: {
                id: true,
                name: true,
                profilePhotoUrl: true,
            },
        };

        const answers = await this.answersRepo.find({
            select: { ...answerSelectFields, replyingTo: answerSelectFields },
            relations: {
                user: true,
                replyingTo: { user: true },
            },
            order: {
                [sortByField]: sortAscOrDesc,
            },
            take: pageSize,
            skip: page * pageSize,
        });

        const formatAnswer = (answer: Answer) => ({
            id: answer.id,
            text: answer.text,
            postedAt: answer.createdAt,

            authorName: answer.user.name,
            authorPhoto: answer.user.profilePhotoUrl,

            replyingToAnswer: answer.replyingTo
                ? formatAnswer(answer.replyingTo)
                : undefined,
        });

        return answers.map(formatAnswer);
    }
}
