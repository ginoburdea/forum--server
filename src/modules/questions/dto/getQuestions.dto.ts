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
    @IsString() @IsUUID() id: string;
    @IsString() preview: string;
    @IsDateString() postedAt: Date;
    @IsBoolean() closed: boolean;
    @IsNumber() @IsInt() @Min(0) answers: number;
    @IsString() authorName: string;
    @IsString() @IsUrl({ require_host: false }) authorPhoto: string;
}

export class GetQuestionsRes {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PreviewQuestion)
    questions: PreviewQuestion[];
}
