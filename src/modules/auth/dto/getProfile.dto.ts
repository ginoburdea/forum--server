import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class GetProfileRes {
    /**
     * The user's full name
     * @example 'John Doe'
     */
    @IsString() @IsNotEmpty() name: string;

    /**
     * The user's email address
     */
    @ApiProperty({ format: 'email' })
    @IsString()
    @IsEmail()
    email: string;

    /**
     * The url to the user's profile photo
     * @example /photo.png
     */
    @IsString() @IsUrl({ require_host: false }) photo: string;

    // /**
    //  * Whether the user wants to receive email notifications when someone answers their question
    //  */
    // @IsBoolean() answersNotifications: boolean;

    // /**
    //  * Whether the user wants to receive email notifications when someone replies to one of his answers
    //  */
    // @IsBoolean() repliesNotifications: boolean;
}
