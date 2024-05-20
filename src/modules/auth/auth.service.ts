import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { randomBytes } from 'crypto';

interface UserData {
    name: string;
    email: string;
    profilePhotoUrl: string;
}

interface AuthInfo {
    token: string;
    expiresAt: Date;
}

const DURATION_30_DAYS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
    constructor(
        private readonly config: ConfigService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Session)
        private readonly sessionRepo: Repository<Session>,
    ) {}

    async idTokenToUserData(idToken: string): Promise<UserData | null> {
        const oAuthClient = new OAuth2Client({
            clientId: this.config.get('GOOGLE_CLIENT_ID'),
            clientSecret: this.config.get('GOOGLE_SECRET'),
        });

        try {
            const ticket: LoginTicket = await oAuthClient.verifyIdToken({
                idToken,
                audience: this.config.get('GOOGLE_CLIENT_ID'),
            });

            const payload = ticket.getPayload();
            return {
                name: payload.name,
                email: payload.email,
                profilePhotoUrl: payload.picture,
            };
        } catch (error) {
            return null;
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.userRepo.findOneBy({ email });
    }

    async createUser(userData: UserData): Promise<User> {
        return await this.userRepo.create(userData).save();
    }

    async genAuthInfo(userId: string): Promise<AuthInfo> {
        const { token, expiresAt } = await this.sessionRepo
            .create({
                user: { id: userId },
                token: randomBytes(256).toString('base64'),
                expiresAt: new Date(Date.now() + DURATION_30_DAYS),
            })
            .save();
        return { token, expiresAt };
    }

    async tokenToUser(token: string): Promise<User | null> {
        const session = await this.sessionRepo.findOne({
            where: { token },
            select: { id: true },
            relations: { user: true },
        });

        return session?.user || null;
    }

    async getProfile(userId: string) {
        const user = await this.userRepo.findOne({
            select: {
                name: true,
                email: true,
                profilePhotoUrl: true,
                answersNotifications: true,
                repliesNotifications: true,
            },
            where: { id: userId },
        });

        return {
            name: user.name,
            email: user.email,
            photo: user.profilePhotoUrl,
            answersNotifications: user.answersNotifications,
            repliesNotifications: user.repliesNotifications,
        };
    }

    async updateProfile(userId: string, updates: Partial<User>) {
        await this.userRepo.update({ id: userId }, updates);
    }

    async invalidateToken(token: string) {
        await this.sessionRepo.delete({ token });
    }
}
