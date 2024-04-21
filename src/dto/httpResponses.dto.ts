import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsObject, IsString } from 'class-validator';

export class Unauthorized {
    /**
     * The error title - what happened?
     */
    @ApiProperty({ enum: ['Unauthorized'] })
    @IsString()
    @IsIn(['Unauthorized'])
    error: string;

    /**
     * The error description - why did it happen?
     * @example 'You must be logged in to perform this action'
     */
    @IsString()
    message: string;
}

export class UnauthorizedHttpError extends Unauthorized {
    /**
     * The status code of the error
     */
    @ApiProperty({ enum: [401] })
    @IsNumber()
    @IsIn([401])
    statusCode: number;
}

export class ForbiddenHttpError extends Unauthorized {
    /**
     * The status code of the error
     */
    @ApiProperty({ enum: [403] })
    @IsNumber()
    @IsIn([403])
    statusCode: number;
}

type ValidationError = {
    [key: string]: string;
};

export class Validation {
    /**
     * The error title - what happened?
     */
    @ApiProperty({ enum: ['Validation error'] })
    @IsString()
    @IsIn(['Validation error'])
    error: string;

    /**
     * The error description - what fields have errors and why did the error happen?
     */
    @ApiProperty({
        type: 'object',
        example: {
            name: 'name must be at least 4 characters long',
            question: 'question is required',
        },
    })
    @IsObject()
    message: ValidationError;
}

export class BadRequestHttpError extends Validation {
    /**
     * The status code of the error
     */
    @ApiProperty({ enum: [400] })
    @IsNumber()
    @IsIn([400])
    statusCode: number;
}

export class UnprocessableEntityHttpError extends Validation {
    /**
     * The status code of the error
     */
    @ApiProperty({ enum: [422] })
    @IsNumber()
    @IsIn([422])
    statusCode: number;
}

export class TooManyRequestsHttpError {
    /**
     * The status code of the error
     */
    @ApiProperty({ enum: [429] })
    @IsNumber()
    @IsIn([429])
    statusCode: number;

    /**
     * The error title - what happened?
     */
    @ApiProperty({ enum: ['Too many requests'] })
    @IsString()
    @IsIn(['Too many requests'])
    error: string;

    /**
     * The error description - why did it happen?
     * @example 'Please wait a few minutes and try again'
     */
    @IsString()
    message: string;
}
