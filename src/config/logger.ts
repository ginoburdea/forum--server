import { ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams } from 'nestjs-pino';

export const loggerConfig: LoggerModuleAsyncParams = {
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        pinoHttp: {
            level: 'trace',
            redact:
                configService.get('NODE_ENV') === 'production'
                    ? ['req.headers.authorization']
                    : [],
            customProps: () => ({ context: 'http-request' }),
            customErrorObject: () => ({}),
            enabled: configService.get('NODE_ENV') !== 'test',
            quietReqLogger: true,
        },
    }),
};
