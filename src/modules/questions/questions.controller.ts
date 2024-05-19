import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '../auth/auth.guard';
import { PostQuestionBody, PostQuestionRes } from './dto/postQuestion.dto';
import { CloseQuestionParams } from './dto/closeQuestion.dto';
import { Question } from './question.entity';
import { GetQuestionsQuery, GetQuestionsRes } from './dto/getQuestions.dto';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
    BadRequestHttpError,
    ForbiddenHttpError,
    UnauthorizedHttpError,
    UnprocessableEntityHttpError,
} from 'src/dto/httpResponses.dto';
import { ApiGlobalResponses } from 'src/utils/errors.decorator';
import { IdToEntityPipe } from '../helpers/idToEntity.pipe';
import { RejectMissingEntityPipe } from 'src/utils/rejectMissingEntity.pipe';
import { UserOwnsEntityPipe } from '../helpers/userOwnsEntity.pipe';
import { FastifyRequest } from 'fastify';
import { GetQuestionParams, GetQuestionRes } from './dto/getQuestion.dto';
import { ConfigService } from '@nestjs/config';

@Controller({ path: 'questions', version: '1' })
@ApiTags('Questions')
@ApiGlobalResponses()
export class QuestionsController {
    constructor(
        private readonly questionsService: QuestionsService,
        private readonly config: ConfigService,
    ) {}

    @Post()
    @HttpCode(200)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Post a question',
        description: 'Posting a question on the forum',
    })
    @ApiOkResponse({
        description: 'Question was posted successfully',
        type: PostQuestionRes,
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in',
        type: UnauthorizedHttpError,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    async postQuestion(
        @Req() req: FastifyRequest,
        @Body() body: PostQuestionBody,
    ) {
        const { questionId } = await this.questionsService.postQuestion(
            req.routeOptions.config.user.id,
            body.question,
        );
        return { questionId };
    }

    @Put(':questionId/close')
    @HttpCode(204)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Close a question',
        description:
            'Marking the question as closed and no longer accepting answers',
    })
    @ApiNoContentResponse({
        description: 'Question closed successfully',
        type: PostQuestionRes,
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in',
        type: UnauthorizedHttpError,
    })
    @ApiForbiddenResponse({
        description: 'The user tries to close a question he did not post',
        type: ForbiddenHttpError,
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
    async closeQuestion(
        @Param() params: CloseQuestionParams,
        @Param(
            'questionId',
            IdToEntityPipe,
            RejectMissingEntityPipe,
            UserOwnsEntityPipe,
        )
        _question: Question,
    ) {
        await this.questionsService.closeQuestion(params.questionId);
    }

    @Get()
    @ApiOperation({
        summary: 'List questions',
        description: 'Listing questions posted by anybody',
    })
    @ApiOkResponse({
        description: 'Listed questions successfully',
        type: GetQuestionsRes,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    async getQuestions(@Query() query: GetQuestionsQuery) {
        const [sortByField, sortAscOrDesc] =
            this.questionsService.convertSortOption(query.sort);

        const previewLength = this.config.get<number>(
            'QUESTION_PREVIEW_LENGTH',
        );
        const pageSize = this.config.get<number>('PAGE_SIZE');
        const { questions, nextPage } =
            await this.questionsService.getQuestions(
                query.page,
                sortByField,
                sortAscOrDesc,
                pageSize,
                previewLength,
            );

        return { questions, nextPage };
    }

    @Get(':questionId')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'List question by id',
        description: 'Listing the question with the provided id',
    })
    @ApiOkResponse({
        description: 'Listed questions successfully',
        type: GetQuestionRes,
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in',
        type: UnauthorizedHttpError,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    @ApiBadRequestResponse({
        description:
            'The question id is invalid or the question does not exist',
        type: BadRequestHttpError,
    })
    async getQuestion(
        @Param() params: GetQuestionParams,
        @Param('questionId', IdToEntityPipe, RejectMissingEntityPipe)
        _question: Question,
    ) {
        const { questions } = await this.questionsService.getQuestions(
            0,
            'question.created_at',
            'DESC',
            1,
            undefined,
            undefined,
            params.questionId,
        );
        const { id, text, postedAt, closed, answers, authorName, authorPhoto } =
            questions[0] as GetQuestionRes;

        return { id, text, postedAt, closed, answers, authorName, authorPhoto };
    }

    @Get('own')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'List own questions',
        description: 'Listing questions posted by the logged in user',
    })
    @ApiOkResponse({
        description: 'Listed own questions successfully',
        type: GetQuestionsRes,
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in',
        type: UnauthorizedHttpError,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    async getOwnQuestions(
        @Query() query: GetQuestionsQuery,
        @Req() req: FastifyRequest,
    ) {
        const [sortByField, sortAscOrDesc] =
            this.questionsService.convertSortOption(query.sort);

        const previewLength = this.config.get<number>(
            'QUESTION_PREVIEW_LENGTH',
        );
        const pageSize = this.config.get<number>('PAGE_SIZE');
        const { questions, nextPage } =
            await this.questionsService.getQuestions(
                query.page,
                sortByField,
                sortAscOrDesc,
                pageSize,
                previewLength,
                req.routeOptions.config.user.id,
            );

        return { questions, nextPage };
    }
}
