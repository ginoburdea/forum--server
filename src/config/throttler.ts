import { ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions, minutes } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

export const throttlerConfig: ThrottlerAsyncOptions = {
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        throttlers: [{ ttl: minutes(1), limit: 20 }],
        storage: new ThrottlerStorageRedisService(
            `redis://${configService.get('REDIS_USERNAME')}:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}/0`,
        ),
    }),
};

export const strictThrottlerConfig = {
    default: { ttl: minutes(1), limit: 5 },
};
