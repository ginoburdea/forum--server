import {
    ArgumentMetadata,
    BadRequestException,
    HttpStatus,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseEntity } from './base.entity';

@Injectable()
export class RejectMissingEntityPipe implements PipeTransform {
    constructor(private readonly dataSource: DataSource) {}

    async transform(
        entity: BaseEntity | null,
        { metatype, data }: ArgumentMetadata,
    ) {
        if (!entity) {
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Validation error',
                message: {
                    [data]: `${metatype.name} not found`,
                },
            });
        }

        return entity;
    }
}
