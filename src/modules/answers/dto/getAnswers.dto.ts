import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    IsUrl,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { numberStringToNumber } from 'src/utils/transforms';

export enum AnswersSortOptions {
    NEWEST = 'newest',
    OLDEST = 'oldest',
}

export enum AnswersLocation {
    AFTER = 'afterRef',
    STARTING_AT = 'startingAtRef',
    BEFORE = 'beforeRef',
    ENDING_AT = 'endingAtRef',
}

export class GetAnswersQuery {
    /**
     * The page number (starts at 0)
     * @example 7
     */
    @Transform(numberStringToNumber)
    @IsInt({ message: 'page must be an integer' })
    @Min(0)
    @IsOptional()
    page?: number;

    /**
     * The answer reference
     */
    @ApiProperty({ format: 'uuid' })
    @ValidateIf((opt) => opt.page === undefined || opt.page === null)
    @IsString()
    answerRef?: string;

    /**
     * The location of the listed answers
     * afterRef = list answers created after the referenced answer
     * startingAtRef = list answers starting with the referenced answer
     * beforeRef = list answers created before the referenced answer
     * endingAtRef = list answers ending with the referenced answer
     */
    @ValidateIf((opt) => opt.page === undefined || opt.page === null)
    @IsEnum(AnswersLocation)
    answersLocation?: AnswersLocation;

    /**
     * The sort option
     */
    @IsEnum(AnswersSortOptions) sort: AnswersSortOptions;
}

export class ListedAnswer {
    /**
     * The answer id
     */
    @ApiProperty({ format: 'uuid' })
    @IsString()
    @IsUUID()
    id: string;

    /**
     * The answer's text
     * @example 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
     */
    @IsString() text: string;

    /**
     * When the answer was posted
     */
    @ApiProperty({ type: 'string', format: 'date-time' })
    @IsDateString()
    postedAt: Date;

    /**
     * The name of the answers's author
     * @example 'John Doe'
     */
    @IsString() authorName: string;

    /**
     * The url to the answers's author profile photo
     * @example /photo.png
     */
    @IsString() @IsUrl({ require_host: false }) authorPhoto: string;

    /**
     * The answer the answer references
     */
    @ValidateNested()
    @Type(() => ListedAnswer)
    @IsOptional()
    replyingToAnswer?: ListedAnswer;
}

export class GetAnswersRes {
    /**
     * The listed answers
     */
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ListedAnswer)
    answers: ListedAnswer[];
}
