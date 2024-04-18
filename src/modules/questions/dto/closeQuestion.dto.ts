import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CloseQuestionParams {
    @IsString() @IsNotEmpty() questionId: string;
}

// export class CloseQuestionRes {
//     @IsString() @IsUUID() questionId: string;
// }
