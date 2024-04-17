import { ConfigService } from '@nestjs/config';
import { loadServer } from './utils/loadServer';

async function bootstrap() {
    const server = await loadServer();

    const config = server.get<ConfigService>(ConfigService);
    await server.listen(
        config.get<number>('APP_PORT'),
        config.get<string>('APP_HOST'),
    );
}
bootstrap();
