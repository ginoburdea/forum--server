import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProfileBody {
    /**
     * The new full name
     * @example 'John Doe'
     */
    @IsOptional() @IsString() @IsNotEmpty() name?: string;

    /**
     * The updated answers notifications preference
     */
    @IsOptional() @IsBoolean() answersNotifications?: boolean;

    /**
     * The updated replies notifications preference
     */
    @IsOptional() @IsBoolean() repliesNotifications?: boolean;
}
