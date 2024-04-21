import { applyDecorators } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import {
    InternalServerErrorHttpError,
    TooManyRequestsHttpError,
} from 'src/dto/httpResponses.dto';

export const ApiGlobalResponses = () => {
    return applyDecorators(
        ApiTooManyRequestsResponse({
            description: 'Too many requests',
            type: TooManyRequestsHttpError,
        }),
        ApiInternalServerErrorResponse({
            description: 'Internal server error',
            type: InternalServerErrorHttpError,
        }),
    );
};
