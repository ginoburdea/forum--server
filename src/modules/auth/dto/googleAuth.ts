import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthBody {
    @IsString() @IsNotEmpty() idToken: string;
}

export class GoogleAuthRes {
    @IsString() @IsNotEmpty() token: string;
    @IsDateString() @IsNotEmpty() expiresAt: string;
}
