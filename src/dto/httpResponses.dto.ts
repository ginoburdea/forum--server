import { ApiProperty } from '@nestjs/swagger';
import {
    IsIn,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class GenericHttpError {
    @IsNumber() statusCode: number;
    @IsString() error: string;
    @IsString() @IsOptional() message?: string;
}

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

export class ValidationHttpError {
    @IsNumber() @IsIn([400, 422]) statusCode: number;
    @IsString() @IsIn(['Validation error']) error: string;
    @IsObject() message: { [key: string]: string };
}
