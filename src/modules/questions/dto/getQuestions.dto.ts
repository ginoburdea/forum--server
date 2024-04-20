import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsString,
    IsUUID,
    IsUrl,
    Min,
    ValidateNested,
} from 'class-validator';

export enum QuestionsSortOptions {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    MOST_ANSWERED = 'mostAnswered',
    LEAST_ANSWERED = 'leastAnswered',
}

export class GetQuestionsQuery {
    @IsInt({ message: 'page must be an integer' }) @Min(0) page: number;
    @IsEnum(QuestionsSortOptions) sort: QuestionsSortOptions;
}

export class PreviewQuestion {
    /**
     * The question id
     */
    @ApiProperty({ format: 'uuid' })
    @IsString()
    @IsUUID()
    id: string;

    /**
     * The question preview text
     * @example 'Lorem ipsum...'
     */
    @IsString() preview: string;

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
     * @example "John Doe"
     */
    @IsString() authorName: string;

    /**
     * The url to the question's author profile photo
     * @example /photo.png
     */
    @IsString() @IsUrl({ require_host: false }) authorPhoto: string;
}

export class GetQuestionsRes {
    /**
     * The listed questions
     */
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PreviewQuestion)
    questions: PreviewQuestion[];
}
