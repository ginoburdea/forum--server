import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
    NestFastifyApplication,
    FastifyAdapter,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { AppModule } from 'src/app.module';
import { validationConfig } from 'src/config/validation';
import { TestUtilsModule } from 'src/modules/test-utils/test-utils.module';
import { ThrottlerExceptionFilter } from './error.filter';

const fastifyAdapter = new FastifyAdapter({
    genReqId: () => randomUUID(),
});

export const loadServer = async (useTestingModule: boolean = false) => {
    let server: NestFastifyApplication;

    if (useTestingModule) {
        const testModule = await Test.createTestingModule({
            imports: [AppModule, TestUtilsModule],
        }).compile();

        server = testModule.createNestApplication(fastifyAdapter);
    } else {
        server = await NestFactory.create(AppModule, fastifyAdapter);
    }

    server.useGlobalPipes(new ValidationPipe(validationConfig));
    server.enableVersioning({ type: VersioningType.URI });
    server.useGlobalFilters(new ThrottlerExceptionFilter());

    const config = server.get(ConfigService);
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

        SwaggerModule.setup('docs', server, swaggerDocument);
    }

    return server;
};
