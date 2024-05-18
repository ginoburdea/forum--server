import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateIf,
} from 'class-validator';

export enum OAuthResponseType {
    REDIRECT = 'redirect',
    JSON = 'json',
}

export class GoogleAuthBody {
    /**
     * The id_token returned from the Google OAuth service
     * @example eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTczNTY4OTYwMCwiYXVkIjoiMTExMTExMS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMTExMTExMTExMTExMTExMTExIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjoidHJ1ZSIsImF0X2hhc2giOiIxMTExMTExMTExMTEiLCJuYW1lIjoiSm9obiBEb2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9waWN0dXJlLnBuZyIsImdpdmVuX25hbWUiOiJKb2huIiwiZmFtaWx5X25hbWUiOiJEb2UifQ.PFXxJy88PPT3YHNsx0TMYXd-aLsccWo8GbdCmkpceOk
     */
    @IsString() @IsNotEmpty() @IsOptional() idToken?: string;

    /**
     * The credential returned from the Google OAuth service
     * @example eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTczNTY4OTYwMCwiYXVkIjoiMTExMTExMS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMTExMTExMTExMTExMTExMTExIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjoidHJ1ZSIsImF0X2hhc2giOiIxMTExMTExMTExMTEiLCJuYW1lIjoiSm9obiBEb2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9waWN0dXJlLnBuZyIsImdpdmVuX25hbWUiOiJKb2huIiwiZmFtaWx5X25hbWUiOiJEb2UifQ.PFXxJy88PPT3YHNsx0TMYXd-aLsccWo8GbdCmkpceOk
     */
    @IsString()
    @IsNotEmpty()
    @ValidateIf((obj) => obj.idToken === null || obj.idToken === undefined)
    credential?: string;
}

export class GoogleAuthQuery {
    /**
     * Whether to return a redirect to the frontend or a JSON body. Omit for JSON
     */
    @IsEnum(OAuthResponseType) @IsOptional() resType?: OAuthResponseType;
}

export class GoogleAuthRes {
    /**
     * The bearer token used for future requests that require authentication
     * @example I-pbbWsCBvletjzjhTZbpbejebcLaBjdNYza5b7y_J5lcF9RrmqKby44G9WCJcSay3zcHcWgmKiCjyVOd8tCbw
     */
    @IsString() @IsNotEmpty() token: string;

    /**
     * The expiration date of the token
     */
    @ApiProperty({ format: 'date-time' })
    @IsDateString()
    @IsNotEmpty()
    expiresAt: string;
}
