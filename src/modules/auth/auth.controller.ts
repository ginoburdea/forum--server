import {
    Body,
    Controller,
    HttpCode,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthBody, GoogleAuthRes } from './dto/googleAuth.dto';
import {
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UnauthorizedHttpError } from 'src/dto/httpResponses.dto';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Authentication')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('google')
    @HttpCode(200)
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
}
