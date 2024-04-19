import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateIf,
} from 'class-validator';

export class PostAnswerBody {
    @IsString() @IsNotEmpty() text: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    replyingTo?: string;
}

export class PostAnswerRes {
    @IsString() @IsUUID() answerId: string;

    @IsString()
    @IsUUID()
    @ValidateIf((_, val) => val !== null)
    replyingToId: string | null;
}
