import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    IsUrl,
    ValidateNested,
} from 'class-validator';
import { PaginationQuery } from 'src/dto/pagination.dto';

export enum AnswersSortOptions {
    NEWEST = 'newest',
    OLDEST = 'oldest',
}

export class GetAnswersQuery extends PaginationQuery {
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
