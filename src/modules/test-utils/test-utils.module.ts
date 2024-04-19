import { Module, Session } from '@nestjs/common';
import { TestUtilsService } from './test-utils.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Session, Question, Answer]),
        AuthModule,
    ],
    providers: [TestUtilsService, AuthService],
})
export class TestUtilsModule {}
