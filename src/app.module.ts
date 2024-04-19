import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/database';
import { configConfig } from './config/config';
import { QuestionsModule } from './modules/questions/questions.module';
import { AnswersModule } from './modules/answers/answers.module';

@Module({
    imports: [
        ConfigModule.forRoot(configConfig),
        TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true }),
        AuthModule,
        QuestionsModule,
        AnswersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
