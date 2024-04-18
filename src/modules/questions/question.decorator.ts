import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { QuestionGuard } from './question.guard';

/**
 * Do not apply `AuthGuard` when using this decorator as it will be automatically applied
 * @param questionLocation @example 'params.questionId' | 'body.id' | 'query.question' | etc.
 */
export const HasQuestion = (questionLocation: string) => {
    return applyDecorators(
        SetMetadata('questionLocation', questionLocation),
        UseGuards(AuthGuard, QuestionGuard),
    );
};
