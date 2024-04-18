import {
    Body,
    Controller,
    HttpCode,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard, ReqWithUser } from '../auth/auth.guard';
import { PostQuestionBody } from './dto/postQuestion.dto';
import { HasQuestion } from './question.decorator';
import { CloseQuestionParams } from './dto/closeQuestion.dto';

@Controller({ path: 'questions', version: '1' })
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) {}

    @Post()
    @HttpCode(200)
    @UseGuards(AuthGuard)
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
    @HasQuestion('params.questionId')
    async closeQuestion(@Param() params: CloseQuestionParams) {
        await this.questionsService.closeQuestion(params.questionId);
    }
}
