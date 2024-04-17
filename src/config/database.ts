import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const config = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: +config.get('DB_PORT'),
    username: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    namingStrategy: new SnakeNamingStrategy(),
};

export default new DataSource(dataSourceOptions);
