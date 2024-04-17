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

export class UnauthorizedHttpError {
    @IsNumber() @IsIn([401]) statusCode: number;
    @IsString() @IsIn(['Unauthorized']) error: string;
    @IsString() message: string;
}

export class ValidationHttpError {
    @IsNumber() @IsIn([400, 422]) statusCode: number;
    @IsString() @IsIn(['Validation error']) error: string;
    @IsObject() message: { [key: string]: string };
}
