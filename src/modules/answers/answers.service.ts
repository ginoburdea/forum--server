import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { isUUID } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
import {
    NewAnswerJobData,
    NewReplyJobData,
} from '../notifications/notifications.consumer';
import { Answer } from './answer.entity';
import {
    AnswersLocation,
    AnswersSortOptions,
    ListedAnswer,
} from './dto/getAnswers.dto';
import expand from 'dot-expand';

interface RefBasedFilter {
    type: 'refBased';
    refId: string;
    location: AnswersLocation;
}

interface PageBasedFilter {
    type: 'pageBased';
    page: number;
}

export type AnswersFilter = RefBasedFilter | PageBasedFilter;

@Injectable()
export class AnswersService {
    constructor(
        @InjectRepository(Answer)
        private readonly answersRepo: Repository<Answer>,
        private readonly config: ConfigService,
        @InjectQueue('notifications')
        private notificationsQueue: Queue,
        private dataSource: DataSource,
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

        await this.notificationsQueue.add('newAnswer', {
            questionId,
            answerId: answer.id,
        } as NewAnswerJobData);
        if (parentAnswerId) {
            await this.notificationsQueue.add('newReply', {
                replyingToAnswerId: parentAnswerId,
                answerId: answer.id,
            } as NewReplyJobData);
        }

        return {
            answerId: answer.id,
            replyingToId: answer.replyingTo.id || null,
        };
    }

    async findAnswer(answerId?: string, relations: string[] = ['user']) {
        if (!isUUID(answerId)) return null;

        return await this.answersRepo.findOne({
            where: { id: answerId },
            relations: relations,
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
        filter: AnswersFilter,
        sortAscOrDesc: 'ASC' | 'DESC',
        questionId: string,
    ): Promise<ListedAnswer[]> {
        const comparisonSignDict: Record<AnswersLocation, string> = {
            [AnswersLocation.AFTER]: '>',
            [AnswersLocation.STARTING_AT]: '>=',
            [AnswersLocation.BEFORE]: '<',
            [AnswersLocation.ENDING_AT]: '<=',
        };

        const pageSize = this.config.get<number>('PAGE_SIZE');

        const sortInSqlQuery =
            filter.type === 'refBased' &&
            filter.location !== AnswersLocation.BEFORE &&
            filter.location !== AnswersLocation.ENDING_AT;

        const query = this.answersRepo
            .createQueryBuilder('answer')
            .select('answer.id', 'id')
            .addSelect('answer.created_at', 'postedAt')
            .addSelect('answer.text', 'text')

            .addSelect('user.name', 'authorName')
            .addSelect('user.profile_photo_url', 'authorPhoto')

            .addSelect('replying_to.id', 'replyingToAnswer.id')
            .addSelect('replying_to.created_at', 'replyingToAnswer.postedAt')
            .addSelect('replying_to.text', 'replyingToAnswer.text')

            .addSelect('replying_to_user.name', 'replyingToAnswer.authorName')
            .addSelect(
                'replying_to_user.profile_photo_url',
                'replyingToAnswer.authorPhoto',
            )

            .leftJoin('user', 'user', 'user.id = answer.user_id')
            .leftJoin(
                'answer',
                'replying_to',
                'answer.id = replying_to.replying_to_id',
            )
            .leftJoin(
                'user',
                'replying_to_user',
                'replying_to_user.id = replying_to.user_id',
            )
            .leftJoin(
                'question',
                'question',
                'question.id = answer.question_id',
            )

            .where(
                filter.type === 'pageBased'
                    ? ':refId'
                    : [
                          'answer.created_at',
                          comparisonSignDict[filter.location],
                          '(SELECT created_at FROM answer WHERE id = :refId)',
                      ].join(' '),
                {
                    refId: filter.type === 'pageBased' ? 'TRUE' : filter.refId,
                },
            )
            .andWhere('question.id = :questionId', { questionId })
            .offset(filter.type === 'pageBased' ? filter.page * pageSize : 0)
            .limit(pageSize)
            .orderBy(
                'answer.created_at',
                sortInSqlQuery ? sortAscOrDesc : 'DESC',
            );

        const results = (await query.getRawMany())
            .map((res) => expand(res))
            .map((res) =>
                res.replyingToAnswer.id
                    ? res
                    : { ...res, replyingToAnswer: undefined },
            );

        if (!sortInSqlQuery) {
            results.sort(
                sortAscOrDesc === 'ASC'
                    ? (a, b) => a.postedAt - b.postedAt
                    : (a, b) => b.postedAt - a.postedAt,
            );
        }

        return results;
    }
}
