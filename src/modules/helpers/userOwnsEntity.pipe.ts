import {
    ForbiddenException,
    HttpStatus,
    Inject,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { BaseEntity } from 'src/utils/base.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class UserOwnsEntityPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly req: FastifyRequest) {}

    async transform(entity: BaseEntity & { user?: User }) {
        if (!this.req.routeOptions.config.user?.id) {
            throw new Error(
                'Authentication guard is required to use this pipe',
            );
        }

        if (
            !entity?.user?.id ||
            entity.user.id !== this.req.routeOptions.config.user.id
        ) {
            throw new ForbiddenException({
                statusCode: HttpStatus.FORBIDDEN,
                error: 'Unauthorized',
                message:
                    'You do not have the required permissions to perform to this action',
            });
        }

        return entity;
    }
}
