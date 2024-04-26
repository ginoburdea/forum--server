import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class IdToEntityPipe implements PipeTransform {
    constructor(private readonly dataSource: DataSource) {}

    async transform(entityId: string, { metatype }: ArgumentMetadata) {
        if (!metatype) {
            throw new Error(
                'Argument must be typed with a TypeORM Entity that extends BaseEntity: User, Question, Answer etc.',
            );
        }

        if (!isUUID(entityId)) return null;

        const Repo = this.dataSource.getRepository(metatype);
        const entity = await Repo.findOne({
            where: { id: entityId },
            relations: { user: true },
        });
        return entity;
    }
}
