import { Module, Session } from '@nestjs/common';
import { TestUtilsService } from './test-utils.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { Question } from '../questions/question.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Session, Question]), AuthModule],
    providers: [TestUtilsService, AuthService],
})
export class TestUtilsModule {}
