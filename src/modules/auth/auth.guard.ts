import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthGuardHeaders } from './dto/guard';
import { FastifyRequest } from 'fastify';
import { validationConfig } from 'src/config/validation';
import { User } from './user.entity';

export interface ReqWithUser extends FastifyRequest {
    user: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
    private errorMessage = 'You must be logged in to perform this action';

    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<ReqWithUser>();
        const headers = { ...req.headers };

        const classObj = plainToInstance(AuthGuardHeaders, headers);
        const errors = await validate(classObj, validationConfig);
        if (errors.length > 0) {
            throw new UnauthorizedException(this.errorMessage);
        }

        const token = headers.authorization.replace('Bearer ', '');
        const user = await this.authService.tokenToUser(token);
        if (!user) {
            throw new UnauthorizedException(this.errorMessage);
        }

        req.user = user;
        return true;
    }
}
