import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsNumber,
    IsString,
    IsUUID,
    IsUrl,
    Min,
} from 'class-validator';

export class GetQuestionParams {
    /**
     * The question id
     */
    @ApiProperty({ format: 'uuid' })
    @IsString()
    @IsUUID()
    questionId: string;
}

export class GetQuestionRes {
    /**
     * The question id
     */
    @ApiProperty({ format: 'uuid' })
    @IsString()
    @IsUUID()
    id: string;

    /**
     * The question text
     * @example 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
     */
    @IsString() text: string;

    /**
     * When the question was posted
     */
    @ApiProperty({ type: 'string', format: 'date-time' })
    @IsDateString()
    postedAt: Date;

    /**
     * Whether the question is closed or not (closed = not accepting new answers)
     */
    @IsBoolean() closed: boolean;

    /**
     * How many answers this question has
     * @example 7
     */
    @IsNumber() @IsInt() @Min(0) answers: number;

    /**
     * The name of the question's author
     * @example 'John Doe'
     */
    @IsString() authorName: string;

    /**
     * The url to the question's author profile photo
     * @example /photo.png
     */
    @IsString() @IsUrl({ require_host: false }) authorPhoto: string;
}
