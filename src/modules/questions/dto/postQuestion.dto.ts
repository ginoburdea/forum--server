import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class PostQuestionBody {
    @IsString() @IsNotEmpty() question: string;
}

export class PostQuestionRes {
    @IsString() @IsUUID() questionId: string;
}
