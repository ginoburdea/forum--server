import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/database';
import { TestUtilsModule } from './modules/test-utils/test-utils.module';
import { configConfig } from './config/config';
import { QuestionsModule } from './modules/questions/questions.module';

@Module({
    imports: [
        ConfigModule.forRoot(configConfig),
        TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true }),
        ...(process.env.NODE_ENV === 'production' ? [] : [TestUtilsModule]),
        AuthModule,
        QuestionsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
