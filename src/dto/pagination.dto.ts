import { IsInt, Min } from 'class-validator';

export abstract class PaginationQuery {
    /**
     * The page number (starts at 0)
     * @example 7
     */
    @IsInt({ message: 'page must be an integer' }) @Min(0) page: number;

    sort: string;
}
