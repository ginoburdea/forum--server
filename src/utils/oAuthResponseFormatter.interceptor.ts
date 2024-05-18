import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
    HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isObject } from 'class-validator';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
    GoogleAuthQuery,
    OAuthResponseType,
} from 'src/modules/auth/dto/googleAuth.dto';
import { URL } from 'url';

@Injectable()
export class OAuthResponseFormatterInterceptor implements NestInterceptor {
    private readonly logger = new Logger(
        OAuthResponseFormatterInterceptor.name,
    );

    constructor(private readonly configService: ConfigService) {}

    private handleOauthRedirect = (
        reply: FastifyReply,
        data: any,
        statusCode: number,
    ) => {
        const baseUrl = new URL(
            this.configService.get<string>('FRONTEND_OAUTH_RESPONSE_URL'),
        );
        baseUrl.searchParams.append(
            'oAuthRes',
            JSON.stringify({ ...data, statusCode: statusCode }),
        );
        const redirectUrl = baseUrl.toString();

        this.logger.debug({ statusCode });
        reply.redirect(302, redirectUrl);

        return new Observable();
    };

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context
            .switchToHttp()
            .getRequest<FastifyRequest<{ Querystring: GoogleAuthQuery }>>();

        if (req.query.resType !== OAuthResponseType.REDIRECT) {
            return next.handle();
        }

        return next.handle().pipe(
            map((data) => {
                const reply = context
                    .switchToHttp()
                    .getResponse<FastifyReply>();

                const statusCode = data.statusCode || reply.statusCode;

                return this.handleOauthRedirect(reply, data, statusCode);
            }),
            catchError((err) => {
                if (!(err instanceof HttpException)) {
                    return throwError(() => err);
                }

                const reply = context
                    .switchToHttp()
                    .getResponse<FastifyReply>();

                const data = err.getResponse();
                const statusCode =
                    isObject(data) && (data as Record<any, any>).statusCode
                        ? (data as Record<any, any>).statusCode
                        : reply.statusCode;

                return this.handleOauthRedirect(reply, data, statusCode);
            }),
        );
    }
}
