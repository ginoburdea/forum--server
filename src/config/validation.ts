import {
    HttpStatus,
    UnprocessableEntityException,
    ValidationPipeOptions,
} from '@nestjs/common';

export const validationConfig: ValidationPipeOptions = {
    transform: true,
    whitelist: true,
    transformOptions: {
        enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
        return new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            error: 'Validation error',
            message: errors.reduce(
                (acc, err) => ({
                    ...acc,
                    [err.property]: Object.values(err.constraints).at(-1),
                }),
                {},
            ),
        });
    },
};
