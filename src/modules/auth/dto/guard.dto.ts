import { IsString, Matches } from 'class-validator';

export class AuthGuardHeaders {
    @IsString() @Matches(/^Bearer .+$/) authorization: string;
}
