import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { PostAnswerBody, PostAnswerRes } from './dto/postAnswer.dto';
import { Has } from '../helpers/has.decorator';
import { Question } from '../questions/question.entity';
import { Answer } from './answer.entity';
import { ReqWithData } from '../helpers/has.guard';
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

@Controller({ path: 'questions/:questionId/answers', version: '1' })
@ApiTags('Answers')
export class AnswersController {
    constructor(private readonly answersService: AnswersService) {}

    @Post()
    @HttpCode(200)
    @Has([
        [Question, 'params.questionId', 'question', false, false],
        [Answer, 'body.replyingTo', null, false, true],
    ])
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
    async postAnswer(@Req() req: ReqWithData, @Body() body: PostAnswerBody) {
        // @ts-expect-error: req.data.question is a generic BaseEntity and doesn't have typings for every property
        if (req.data.question.closedAt) {
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
            req.user.id,
            req.data.question.id,
            body.text,
            body.replyingTo,
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
    async getAnswers(@Query() query: GetAnswersQuery) {
        const [sortByField, sortAscOrDesc] =
            this.answersService.convertSortOption(query.sort);

        const answers = await this.answersService.getAnswers(
            query.page,
            sortByField as 'createdAt',
            sortAscOrDesc,
        );

        return { answers };
    }
}
