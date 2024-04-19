import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { HasGuard } from './has.guard';
import { BaseEntity } from 'src/utils/base.entity';

export type HasParam = [
    Entity: typeof BaseEntity,
    location: string,
    appendToKey: string | null,
    userMustOwnModel: boolean,
    skipIfNotPresent: boolean,
];

/**
 * Checks the existence of models from the current request (from params, body, query, etc.)
 *
 * ATTENTION! Do not apply `AuthGuard` when using this decorator as it will be automatically applied
 * @param answerLocation @example 'params.questionId' | 'body.id' | 'query.question' | etc.
 */
export const Has = (params: HasParam[]) => {
    return applyDecorators(
        SetMetadata(`has-params`, params),
        UseGuards(AuthGuard, HasGuard),
    );
};
