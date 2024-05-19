import {
    NestApplicationOptions,
    ValidationPipe,
    VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
    NestFastifyApplication,
    FastifyAdapter,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { AppModule } from 'src/app.module';
import { validationConfig } from 'src/config/validation';
import { TestUtilsModule } from 'src/modules/test-utils/test-utils.module';
import {
    InternalServerErrorFilter,
    ThrottlerExceptionFilter,
} from './error.filter';
import { Logger } from 'nestjs-pino';
import { LogUserIdInterceptor } from './logUserId.interceptor';

const fastifyAdapter = new FastifyAdapter({
    genReqId: () => randomUUID(),
});

const excludeUnwantedParams = (doc: OpenAPIObject) => {
    for (const path in doc.paths) {
        for (const method in doc.paths[path]) {
            for (const location of ['parameters']) {
                for (const item of doc.paths[path][method][location]) {
                    if (!item.description) {
                        delete doc.paths[path][method][location];
                    }
                }
            }
        }
    }
};

export const loadServer = async (useTestingModule: boolean = false) => {
    let server: NestFastifyApplication;

    const serverOptions: NestApplicationOptions = {
        bufferLogs: true,
    };

    if (useTestingModule) {
        const testModule = await Test.createTestingModule({
            imports: [AppModule, TestUtilsModule],
        }).compile();

        server = testModule.createNestApplication(
            fastifyAdapter,
            serverOptions,
        );
    } else {
        server = await NestFactory.create(
            AppModule,
            fastifyAdapter,
            serverOptions,
        );
    }

    server.useLogger(server.get(Logger));
    server.useGlobalPipes(new ValidationPipe(validationConfig));
    server.enableVersioning({ type: VersioningType.URI });
    server.useGlobalFilters(
        new ThrottlerExceptionFilter(),
        new InternalServerErrorFilter(),
    );
    server.useGlobalInterceptors(new LogUserIdInterceptor());

    const config = server.get(ConfigService);
    server.enableCors({ origin: config.get('CORS_ORIGIN') });

    if (config.get('NODE_ENV') !== 'production') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Forum API')
            .setDescription('The documentation of the Forum API')
            .addServer(
                `http://${config.get('APP_HOST')}:${config.get('APP_PORT')}`,
                'Development server',
            )
            .addBearerAuth()
            .build();

        const swaggerDocument = SwaggerModule.createDocument(
            server,
            swaggerConfig,
        );
        excludeUnwantedParams(swaggerDocument);

        SwaggerModule.setup('docs', server, swaggerDocument);
    }

    return server;
};
