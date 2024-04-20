import {
    BadRequestException,
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
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
}
