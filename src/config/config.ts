import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export const configConfig: ConfigModuleOptions = {
    ignoreEnvFile: true,
    isGlobal: true,
    validationSchema: Joi.object({
        NODE_ENV: Joi.string()
            .valid('development', 'production', 'test')
            .default('development'),
        APP_PORT: Joi.number().port(),
        APP_HOST: Joi.string().valid('localhost', '0.0.0.0'),
        DB_URL: Joi.string().uri(),
        DB_HOST: Joi.string().hostname(),
        DB_PORT: Joi.number().port(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_NAME: Joi.string(),
        GOOGLE_CLIENT_ID: Joi.string(),
        GOOGLE_SECRET: Joi.string(),
    }),
    validationOptions: {
        allowUnknown: true,
        stripUnknown: false,
    } as Joi.ValidationOptions,
};
