import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Session } from './session.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Session])],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
