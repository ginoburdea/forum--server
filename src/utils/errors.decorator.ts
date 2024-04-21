import { applyDecorators } from '@nestjs/common';
import { ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { TooManyRequestsHttpError } from 'src/dto/httpResponses.dto';

export const ApiGlobalResponses = () => {
    return applyDecorators(
        ApiTooManyRequestsResponse({
            description: 'Too many requests',
            type: TooManyRequestsHttpError,
        }),
    );
};
