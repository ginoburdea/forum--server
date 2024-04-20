import { SharedBullAsyncConfiguration } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

export const bullConfig: SharedBullAsyncConfiguration = {
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        redis: {
            host: configService.get('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            username: configService.get('REDIS_USERNAME'),
            password: configService.get('REDIS_PASSWORD'),
        },
    }),
};
