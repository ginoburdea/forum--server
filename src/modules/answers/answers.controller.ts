import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AnswersFilter, AnswersService } from './answers.service';
import { PostAnswerBody, PostAnswerRes } from './dto/postAnswer.dto';
import { Question } from '../questions/question.entity';
import { Answer } from './answer.entity';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiUnprocessableEntityResponse,
    ApiTags,
    ApiOkResponse,
} from '@nestjs/swagger';
import {
    UnauthorizedHttpError,
    BadRequestHttpError,
    UnprocessableEntityHttpError,
} from 'src/dto/httpResponses.dto';
import { GetAnswersQuery, GetAnswersRes } from './dto/getAnswers.dto';
import { ApiGlobalResponses } from 'src/utils/errors.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { RejectMissingEntityPipe } from 'src/utils/rejectMissingEntity.pipe';
import { IdToEntityPipe } from '../helpers/idToEntity.pipe';
import { FastifyRequest } from 'fastify';

@Controller({ path: 'questions/:questionId/answers', version: '1' })
@ApiTags('Answers')
@ApiGlobalResponses()
export class AnswersController {
    constructor(private readonly answersService: AnswersService) {}

    @Post()
    @HttpCode(200)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Post an answer',
        description: 'Posting an answer to a question',
    })
    @ApiOkResponse({
        description: 'Answer posted successfully',
        type: PostAnswerRes,
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in',
        type: UnauthorizedHttpError,
    })
    @ApiBadRequestResponse({
        description:
            'The question / answer id is invalid or the question / answer does not exist',
        type: BadRequestHttpError,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    async postAnswer(
        @Req() req: FastifyRequest,
        @Body() body: PostAnswerBody,
        @Param('questionId', IdToEntityPipe, RejectMissingEntityPipe)
        question: Question,
        @Body('replyingTo', IdToEntityPipe) replyingToAnswer?: Answer,
    ) {
        if (question.closedAt) {
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Validation error',
                message: {
                    questionId:
                        'question is closed and does not accept new answers',
                },
            });
        }

        const { answerId, replyingToId } = await this.answersService.postAnswer(
            req.routeOptions.config.user.id,
            question.id,
            body.text,
            replyingToAnswer?.id,
        );
        return { answerId, replyingToId };
    }

    @Get()
    @ApiOperation({
        summary: 'List answers',
        description: 'Listing answers for the specified question',
    })
    @ApiOkResponse({
        description: 'Listed answers successfully',
        type: GetAnswersRes,
    })
    @ApiBadRequestResponse({
        description:
            'The question id is invalid or the question does not exist',
        type: BadRequestHttpError,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    async getAnswers(
        @Query() query: GetAnswersQuery,
        @Param('questionId', IdToEntityPipe, RejectMissingEntityPipe)
        _question: Question,
    ) {
        let filter: AnswersFilter;

        if (query.page === undefined || query.page === null) {
            const answer = await this.answersService.findAnswer(
                query.answerRef,
            );

            if (!answer) {
                throw new BadRequestException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    error: 'Validation error',
                    message: {
                        answerRef: 'answer not found',
                    },
                });
            }

            filter = {
                type: 'refBased',
                refId: query.answerRef,
                location: query.answersLocation,
            };
        } else {
            filter = {
                type: 'pageBased',
                page: query.page,
            };
        }

        const [, sortAscOrDesc] = this.answersService.convertSortOption(
            query.sort,
        );

        const answers = await this.answersService.getAnswers(
            filter,
            sortAscOrDesc,
        );

        return { answers };
    }
}
