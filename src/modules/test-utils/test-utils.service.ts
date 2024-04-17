import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TestUtilsService {
    constructor(public dataSource: DataSource) {}

    async truncateTables() {
        const tableNames = this.dataSource.entityMetadatas
            .map((entity) => entity.tableName)
            .reduce(
                (acc, curr) =>
                    acc.indexOf(curr) !== -1 ? acc : [...acc, curr],
                [],
            )
            .map((tableName) => `"${tableName}"`)
            .join(', ');

        await this.dataSource.query(`TRUNCATE ${tableNames} CASCADE`);
    }
}
