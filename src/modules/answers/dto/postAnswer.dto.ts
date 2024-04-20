import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateIf,
} from 'class-validator';

export class PostAnswerBody {
    /**
     * The answer that will be posted
     * @example 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
     */
    @IsString() @IsNotEmpty() text: string;

    /**
     * The id of the answer the user will reply to
     */
    @ApiProperty({ format: 'uuid' })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    replyingTo?: string;
}

export class PostAnswerRes {
    /**
     * The id of the created answer
     */
    @ApiProperty({ format: 'uuid' })
    @IsString()
    @IsUUID()
    answerId: string;

    /**
     * The id of the answer the user replied to
     */
    @ApiProperty({ format: 'uuid' })
    @IsString()
    @IsUUID()
    @ValidateIf((_, val) => val !== null)
    replyingToId: string | null;
}
