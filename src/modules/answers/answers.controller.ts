import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { PostAnswerBody } from './dto/postAnswer.dto';
import { Has } from '../helpers/has.decorator';
import { Question } from '../questions/question.entity';
import { Answer } from './answer.entity';
import { ReqWithData } from '../helpers/has.guard';

@Controller({ path: 'questions/:questionId/answers', version: '1' })
export class AnswersController {
    constructor(private readonly answersService: AnswersService) {}

    @Post()
    @HttpCode(200)
    @Has([
        [Question, 'params.questionId', 'question', false, false],
        [Answer, 'body.replyingTo', null, false, true],
    ])
    async postAnswer(@Req() req: ReqWithData, @Body() body: PostAnswerBody) {
        const { answerId, replyingToId } = await this.answersService.postAnswer(
            req.user.id,
            req.data.question.id,
            body.text,
            body.replyingTo,
        );
        return { answerId, replyingToId };
    }
}