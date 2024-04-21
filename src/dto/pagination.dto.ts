import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { numberStringToNumber } from 'src/utils/transforms';

export abstract class PaginationQuery {
    /**
     * The page number (starts at 0)
     * @example 7
     */
    @Transform(numberStringToNumber)
    @IsInt({ message: 'page must be an integer' })
    @Min(0)
    page: number;

    sort: string;
}
