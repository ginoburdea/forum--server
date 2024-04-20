import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const configConfig: ConfigModuleOptions = {
    ignoreEnvFile: true,
    isGlobal: true,
    validationSchema: Joi.object({
        NODE_ENV: Joi.string()
            .valid('development', 'production', 'test')
            .default('development'),
        APP_PORT: Joi.number().port().required(),
        APP_HOST: Joi.string().valid('localhost', '0.0.0.0').required(),

        DB_HOST: Joi.string().hostname().required(),
        DB_PORT: Joi.number().port().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),

        REDIS_HOST: Joi.string().hostname().required(),
        REDIS_PORT: Joi.number().port().required(),
        REDIS_USERNAME: Joi.string().required(),
        REDIS_PASSWORD: Joi.string().required(),

        SMTP_HOST: Joi.string(),
        SMTP_PORT: Joi.number().port(),
        SMTP_SECURE: Joi.boolean(),
        SMTP_USERNAME: Joi.string(),
        SMTP_PASSWORD: Joi.string(),
        SMTP_EMAIL: Joi.string().email(),
        SMTP_NAME: Joi.string(),
        SMTP_REPLY_TO: Joi.string().email(),

        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_SECRET: Joi.string().required(),

        PAGE_SIZE: Joi.number().integer().positive().required(),
        QUESTION_PREVIEW_LENGTH: Joi.number().integer().positive().required(),
    }),
    validationOptions: {
        allowUnknown: true,
        stripUnknown: false,
    } as Joi.ValidationOptions,
};
