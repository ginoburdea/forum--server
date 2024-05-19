import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ListedQuestion, QuestionsSortOptions } from './dto/getQuestions.dto';
import { ConfigService } from '@nestjs/config';
import { GetQuestionRes } from './dto/getQuestion.dto';

@Injectable()
export class QuestionsService {
    constructor(
        @InjectRepository(Question)
        private readonly questionsRepo: Repository<Question>,
        private readonly config: ConfigService,
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

    convertSortOption(option: QuestionsSortOptions) {
        const dict: {
            [key in QuestionsSortOptions]: [
                field: string,
                ascOrDesc: 'ASC' | 'DESC',
            ];
        } = {
            [QuestionsSortOptions.NEWEST]: ['question.created_at', 'DESC'],
            [QuestionsSortOptions.OLDEST]: ['question.created_at', 'ASC'],
            [QuestionsSortOptions.MOST_ANSWERED]: ['answers', 'DESC'],
            [QuestionsSortOptions.LEAST_ANSWERED]: ['answers', 'ASC'],
        };
        return dict[option];
    }

    async getQuestions(
        page: number,
        sortByField: string,
        sortAscOrDesc: 'ASC' | 'DESC',
        pageSize: number,
        previewLength?: number,
        userId?: string,
        questionId?: string,
    ): Promise<{
        questions: (ListedQuestion | GetQuestionRes)[];
        nextPage: boolean;
    }> {
        const questions = await this.questionsRepo
            .createQueryBuilder('question')
            .select('question.id', 'id')
            .addSelect(
                previewLength
                    ? `case when length(question.text) <= ${previewLength} then question.text else left(question.text, ${previewLength}) || '...' end`
                    : 'text',
                previewLength ? 'preview' : 'text',
            )
            .addSelect('question.created_at', 'postedAt')
            .addSelect('question.closed_at is not null', 'closed')
            .addSelect(
                (queryBuilder) =>
                    queryBuilder
                        .select('cast(count(*) as int)')
                        .from('answer', 'answer')
                        .where('answer.question_id = question.id'),
                'answers',
            )
            .addSelect('user.name', 'authorName')
            .addSelect('user.profile_photo_url', 'authorPhoto')
            .leftJoin('user', 'user', 'question.user_id = user.id')
            .where(userId ? 'question.user_id = :userId' : 'TRUE', {
                userId,
            })
            .andWhere(questionId ? 'question.id = :questionId' : 'TRUE', {
                questionId,
            })
            .orderBy(sortByField, sortAscOrDesc)
            .limit(pageSize + 1)
            .offset(page * pageSize)
            .getRawMany();

        return {
            questions: questions.slice(0, pageSize),
            nextPage: questions.length > pageSize,
        };
    }
}
