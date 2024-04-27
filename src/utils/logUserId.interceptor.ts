import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogUserIdInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LogUserIdInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            tap(() => {
                const req = context.switchToHttp().getRequest<FastifyRequest>();
                const userId = req.routeOptions.config?.user?.id;
                this.logger.debug({ userId });
            }),
        );
    }
}
