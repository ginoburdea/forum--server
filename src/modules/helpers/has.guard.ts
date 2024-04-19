import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
    HttpStatus,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HasParam } from './has.decorator';
import { ReqWithUser } from '../auth/auth.guard';
import { BaseEntity } from 'src/utils/base.entity';
import {
    HelperError,
    HelperErrorCode,
    HelpersService,
} from './helpers.service';

export interface ReqWithData extends ReqWithUser {
    data: {
        [key: string]: BaseEntity;
    };
}

/**
 * Checks the existence of models from the current request (from params, body, query, etc.)
 *
 * ATTENTION! Do not use this class directly. Use the `@Has()` decorator instead
 */
@Injectable()
export class HasGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly helpersService: HelpersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<ReqWithData>();

        const params = this.reflector.get<HasParam[]>(
            'has-params',
            context.getHandler(),
        );
        for (const [
            Entity,
            location,
            appendToKey,
            userMustOwnModel,
            skipIfNotPresent,
        ] of params) {
            try {
                const { entityId, key } = this.helpersService.extractEntityId(
                    { body: req.body, query: req.query, params: req.params },
                    location,
                );
                if (entityId === undefined && skipIfNotPresent) continue;

                const { entity } = await this.helpersService.handleParam(
                    entityId,
                    key,
                    Entity,
                    userMustOwnModel,
                    req.user.id,
                );

                if (appendToKey) {
                    if (!req.data) req.data = {};
                    req.data[appendToKey] = entity;
                }
            } catch (err) {
                if (!(err instanceof HelperError)) throw err;

                if (err.code === HelperErrorCode.ENTITY_NOT_FOUND) {
                    throw new BadRequestException({
                        statusCode: HttpStatus.BAD_REQUEST,
                        error: 'Validation error',
                        message: err.description,
                    });
                }

                if (err.code === HelperErrorCode.NOT_ENOUGH_PERMISSIONS) {
                    throw new ForbiddenException({
                        statusCode: HttpStatus.FORBIDDEN,
                        error: 'Unauthorized',
                        message: err.description,
                    });
                }

                throw err;
            }
        }

        return true;
    }
}
