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
import { PostQuestionBody } from './dto/postQuestion.dto';
import { CloseQuestionParams } from './dto/closeQuestion.dto';
import { Question } from './question.entity';
import { Has } from '../helpers/has.decorator';
import { GetQuestionsQuery } from './dto/getQuestions.dto';

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
    @Has([[Question, 'params.questionId', 'question', true, false]])
    async closeQuestion(@Param() params: CloseQuestionParams) {
        await this.questionsService.closeQuestion(params.questionId);
    }

    @Get()
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
}
