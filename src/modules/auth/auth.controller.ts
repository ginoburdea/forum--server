import {
    Body,
    Controller,
    Get,
    Header,
    HttpCode,
    Logger,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    GoogleAuthBody,
    GoogleAuthQuery,
    GoogleAuthRes,
} from './dto/googleAuth.dto';
import {
    ApiBearerAuth,
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
import { AuthGuard } from './auth.guard';
import { GetProfileRes } from './dto/getProfile.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiGlobalResponses } from 'src/utils/errors.decorator';
import { strictThrottlerConfig } from 'src/config/throttler';
import { UpdateProfileBody } from './dto/updateProfile.dto';
import { FastifyRequest } from 'fastify';
import { OAuthResponseFormatterInterceptor } from 'src/utils/oAuthResponseFormatter.interceptor';
import { OAuthResponseApiDocs } from 'src/utils/oAuthResponseApiDocs';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Authentication and profile information')
@ApiGlobalResponses()
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) {}

    @Post('google')
    @HttpCode(200)
    @Throttle(strictThrottlerConfig)
    @UseInterceptors(OAuthResponseFormatterInterceptor)
    @OAuthResponseApiDocs()
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
    async loginWithGoogle(
        @Body() body: GoogleAuthBody,
        @Query() _query: GoogleAuthQuery,
    ) {
        const userData = await this.authService.idTokenToUserData(
            body.idToken || body.credential,
        );
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

        this.logger.debug({ userId: user.id });
        return { token, expiresAt };
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @HttpCode(204)
    @Throttle(strictThrottlerConfig)
    @UseInterceptors(OAuthResponseFormatterInterceptor)
    @OAuthResponseApiDocs()
    @ApiOperation({
        summary: 'Logout',
        description: 'Logs out the current user and invalidates the token',
    })
    @ApiOkResponse({
        description: 'Successful log out',
        type: GoogleAuthRes,
    })
    @ApiUnauthorizedResponse({
        description: 'The user is not logged in',
        type: UnauthorizedHttpError,
    })
    async logout(@Req() req: FastifyRequest) {
        const token = req.headers.authorization.replace('Bearer ', '');
        await this.authService.invalidateToken(token);
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
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
    async getProfile(@Req() req: FastifyRequest) {
        const {
            name,
            email,
            photo,
            answersNotifications,
            repliesNotifications,
        } = await this.authService.getProfile(req.routeOptions.config.user.id);

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
    @ApiBearerAuth()
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
        @Req() req: FastifyRequest,
    ) {
        await this.authService.updateProfile(
            req.routeOptions.config.user.id,
            body,
        );
    }
}
