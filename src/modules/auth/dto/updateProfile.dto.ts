import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileBody {
    /**
     * The new full name
     * @example 'John Doe'
     */
    @IsString() @IsNotEmpty() @IsOptional() name?: string;

    /**
     * The updated answers notifications preference
     */
    @IsBoolean()
    @IsOptional()
    answersNotifications?: boolean;

    /**
     * The updated replies notifications preference
     */
    @IsBoolean()
    @IsOptional()
    repliesNotifications?: boolean;
}
