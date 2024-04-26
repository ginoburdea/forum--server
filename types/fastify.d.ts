import { User } from 'src/modules/auth/user.entity';

declare module 'fastify' {
    export interface FastifyContextConfig {
        user?: User;
    }
}
