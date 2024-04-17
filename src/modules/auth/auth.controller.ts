import {
    Body,
    Controller,
    HttpCode,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthBody } from './dto/googleAuth';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('google')
    @HttpCode(200)
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
