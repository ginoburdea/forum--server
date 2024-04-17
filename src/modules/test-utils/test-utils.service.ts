import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { faker } from '@faker-js/faker';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TestUtilsService {
    constructor(
        public dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly authService: AuthService,
    ) {}

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

    async genUser(overrides: Partial<User> = {}) {
        return this.userRepo
            .create({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                profilePhotoUrl: faker.image.avatar(),
                ...overrides,
            })
            .save();
    }

    async genAuthHeaders(user?: User) {
        const _user = user || (await this.genUser());
        const session = await this.authService.genAuthInfo(_user.id);
        return { authorization: 'Bearer ' + session.token };
    }
}
