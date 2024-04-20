import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthBody {
    /**
     * The id_token returned from the Google OAuth service
     * @example eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTczNTY4OTYwMCwiYXVkIjoiMTExMTExMS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMTExMTExMTExMTExMTExMTExIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjoidHJ1ZSIsImF0X2hhc2giOiIxMTExMTExMTExMTEiLCJuYW1lIjoiSm9obiBEb2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9waWN0dXJlLnBuZyIsImdpdmVuX25hbWUiOiJKb2huIiwiZmFtaWx5X25hbWUiOiJEb2UifQ.PFXxJy88PPT3YHNsx0TMYXd-aLsccWo8GbdCmkpceOk
     */
    @IsString() @IsNotEmpty() idToken: string;
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
