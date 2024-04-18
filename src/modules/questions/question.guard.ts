import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
    ForbiddenException,
    HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QuestionsService } from './questions.service';
import { ReqWithUser } from '../auth/auth.guard';

/**
 * Do not use this class directly. Instead use the HasQuestion decorator
 */
@Injectable()
export class QuestionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly questionsService: QuestionsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<ReqWithUser>();

        const regexp = /^(?<location>params|body|query)\.(?<key>.+)$/;
        const questionLocation = this.reflector.get<string>(
            'questionLocation',
            context.getHandler(),
        );
        const match = regexp.exec(questionLocation);
        if (!match) {
            throw new Error(
                `Invalid question location. It must match the pattern ${regexp}`,
            );
        }

        const question = await this.questionsService.findQuestion(
            req[match.groups.location][match.groups.key],
        );
        if (!question) {
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Validation error',
                message: {
                    [match.groups.key]: 'Question not found',
                },
            });

            // throw new BadRequestException({
            //     [match.groups.key]: 'Question not found',
            // });
        }
        if (question.user.id !== req.user.id) {
            throw new ForbiddenException({
                statusCode: HttpStatus.FORBIDDEN,
                error: 'Unauthorized',
                message: 'You do not have access to this action',
            });
        }
        return true;
    }
}
