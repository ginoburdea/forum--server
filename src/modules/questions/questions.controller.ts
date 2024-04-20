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
import { AuthGuard, ReqWithUser } from '../auth/auth.guard';
import { PostQuestionBody, PostQuestionRes } from './dto/postQuestion.dto';
import { CloseQuestionParams } from './dto/closeQuestion.dto';
import { Question } from './question.entity';
import { Has } from '../helpers/has.decorator';
import { GetQuestionsQuery, GetQuestionsRes } from './dto/getQuestions.dto';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
    BadRequestHttpError,
    UnauthorizedHttpError,
    UnprocessableEntityHttpError,
} from 'src/dto/httpResponses.dto';

@Controller({ path: 'questions', version: '1' })
@ApiTags('Questions')
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) {}

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
        @Req() req: ReqWithUser,
        @Body() body: PostQuestionBody,
    ) {
        const { questionId } = await this.questionsService.postQuestion(
            req.user.id,
            body.question,
        );
        return { questionId };
    }

    @Put(':questionId/close')
    @HttpCode(204)
    @Has([[Question, 'params.questionId', 'question', true, false]])
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
    @ApiBadRequestResponse({
        description:
            'The question id is invalid or the question does not exist',
        type: BadRequestHttpError,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    async closeQuestion(@Param() params: CloseQuestionParams) {
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

        const questions = await this.questionsService.getQuestions(
            query.page,
            sortByField,
            sortAscOrDesc,
        );

        return { questions };
    }

    @Get('own')
    @UseGuards(AuthGuard)
    async getOwnQuestions(
        @Query() query: GetQuestionsQuery,
        @Req() req: ReqWithUser,
    ) {
        const [sortByField, sortAscOrDesc] =
            this.questionsService.convertSortOption(query.sort);

        const questions = await this.questionsService.getQuestions(
            query.page,
            sortByField,
            sortAscOrDesc,
            req.user.id,
        );

        return { questions };
    }
}
