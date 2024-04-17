import {
    UnprocessableEntityException,
    ValidationPipeOptions,
} from '@nestjs/common';

export const validationConfig: ValidationPipeOptions = {
    transform: true,
    whitelist: true,
    exceptionFactory: (errors) => {
        return new UnprocessableEntityException({
            statusCode: 422,
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
