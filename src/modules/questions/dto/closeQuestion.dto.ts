import { IsNotEmpty, IsString } from 'class-validator';

export class CloseQuestionParams {
    @IsString() @IsNotEmpty() questionId: string;
}
