import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { resolve } from 'path';
import { ConfigService } from '@nestjs/config';

export const mailerConfig: MailerAsyncOptions = {
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        return {
            transport: {
                host: configService.get('SMTP_HOST'),
                port: configService.get('SMTP_PORT'),
                secure: configService.get('SMTP_SECURE'),
                auth: {
                    user: configService.get('SMTP_USERNAME'),
                    pass: configService.get('SMTP_PASSWORD'),
                },
            },
            defaults: {
                from: {
                    address: configService.get('SMTP_EMAIL'),
                    name: configService.get('SMTP_NAME'),
                },
                replyTo: configService.get('SMTP_REPLY_TO'),
            },
            template: {
                dir: resolve('templates/emails'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        };
    },
};
