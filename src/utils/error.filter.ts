import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { FastifyReply } from 'fastify';
import {
    InternalServerErrorHttpError,
    TooManyRequestsHttpError,
} from 'src/dto/httpResponses.dto';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
    catch(exception: ThrottlerException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const reply = ctx.getResponse<FastifyReply>();

        return reply.status(429).send({
            statusCode: 429,
            error: 'Too many requests',
            message: 'Please wait a few minutes and try again',
        } as TooManyRequestsHttpError);
    }
}

@Catch()
export class InternalSererErrorFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const reply = ctx.getResponse<FastifyReply>();

        if (exception instanceof HttpException) {
            return reply
                .status(exception.getStatus())
                .send(exception.getResponse());
        }

        return reply.status(500).send({
            statusCode: 500,
            error: 'Internal server error',
            message: 'An expected error occurred. Please try again later',
        } as InternalServerErrorHttpError);
    }
}
