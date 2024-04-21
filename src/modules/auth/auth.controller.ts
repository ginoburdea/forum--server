import {
    Body,
    Controller,
    Get,
    HttpCode,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthBody, GoogleAuthRes } from './dto/googleAuth.dto';
import {
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
    UnauthorizedHttpError,
    UnprocessableEntityHttpError,
} from 'src/dto/httpResponses.dto';
import { AuthGuard, ReqWithUser } from './auth.guard';
import { GetProfileRes } from './dto/getProfile.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiGlobalResponses } from 'src/utils/errors.decorator';
import { strictThrottlerConfig } from 'src/config/throttler';
import { UpdateProfileBody } from './dto/updateProfile.dto';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Authentication and profile information')
@ApiGlobalResponses()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('google')
    @HttpCode(200)
    @Throttle(strictThrottlerConfig)
    @ApiOperation({
        summary: 'Authentication via Google',
        description:
            'Authenticates a user via Google. If the user does not have an account, one will be created for him',
    })
    @ApiOkResponse({
        description: 'Successful authentication',
        type: GoogleAuthRes,
    })
    @ApiUnauthorizedResponse({
        description: 'The Google id token is invalid',
        type: UnauthorizedHttpError,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    async loginWithGoogle(@Body() body: GoogleAuthBody) {
        const userData = await this.authService.idTokenToUserData(body.idToken);
        if (!userData) {
            throw new UnauthorizedException(
                'Authentication failed. Log in with Google again to retry',
            );
        }

        const user =
            (await this.authService.getUserByEmail(userData.email)) ||
            (await this.authService.createUser(userData));

        const { token, expiresAt } = await this.authService.genAuthInfo(
            user.id,
        );
        return { token, expiresAt };
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: 'Get profile info',
        description: 'Gets the profile information of the logged in user',
    })
    @ApiOkResponse({
        description: 'Got the profile information successfully',
        type: GetProfileRes,
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in',
        type: UnauthorizedHttpError,
    })
    async getProfile(@Req() req: ReqWithUser) {
        const {
            name,
            email,
            photo,
            answersNotifications,
            repliesNotifications,
        } = await this.authService.getProfile(req.user.id);

        return {
            name,
            email,
            photo,
            answersNotifications,
            repliesNotifications,
        };
    }

    @Patch('profile')
    @HttpCode(204)
    @UseGuards(AuthGuard)
    @ApiOperation({
        summary: 'Update profile info',
        description: 'Updates the profile information of the logged in user',
    })
    @ApiNoContentResponse({
        description: 'Updated the profile information successfully',
    })
    @ApiUnprocessableEntityResponse({
        description: 'Some data is invalid',
        type: UnprocessableEntityHttpError,
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in',
        type: UnauthorizedHttpError,
    })
    async updateProfile(
        @Body() body: UpdateProfileBody,
        @Req() req: ReqWithUser,
    ) {
        await this.authService.updateProfile(req.user.id, body);
    }
}
