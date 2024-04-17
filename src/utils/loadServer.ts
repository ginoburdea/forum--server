import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
    NestFastifyApplication,
    FastifyAdapter,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { AppModule } from 'src/app.module';
import { validationConfig } from 'src/config/validation';

const fastifyAdapter = new FastifyAdapter({
    genReqId: () => randomUUID(),
});

export const loadServer = async (useTestingModule: boolean = false) => {
    let server: NestFastifyApplication;

    if (useTestingModule) {
        const testModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        server = testModule.createNestApplication(fastifyAdapter);
    } else {
        server = await NestFactory.create(AppModule, fastifyAdapter);
    }

    server.useGlobalPipes(new ValidationPipe(validationConfig));
    server.enableVersioning({ type: VersioningType.URI });

    return server;
};
