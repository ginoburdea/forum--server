import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class PostQuestionBody {
    /**
     * The question to be posted
     * @example 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.?'
     */
    @IsString() @IsNotEmpty() question: string;
}

export class PostQuestionRes {
    /**
     * The id of the posted question
     */
    @ApiProperty({ format: 'uuid' })
    @IsString()
    @IsUUID()
    questionId: string;
}
