import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { FastifyReply } from 'fastify';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const reply = ctx.getResponse<FastifyReply>();
        const status = exception.getStatus();

        return reply.status(status).send({
            statusCode: 429,
            error: 'Too many requests',
            message: 'Please wait a few minutes and try again',
        });
    }
}
