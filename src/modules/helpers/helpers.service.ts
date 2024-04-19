import { Injectable } from '@nestjs/common';
import { HasParam } from './has.decorator';
import { isUUID } from 'class-validator';
import { DataSource } from 'typeorm';

export enum HelperErrorCode {
    INVALID_LOCATION = 'INVALID_LOCATION',
    ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
    NOT_ENOUGH_PERMISSIONS = 'NOT_ENOUGH_PERMISSIONS',
}

export class HelperError extends Error {
    constructor(
        public description: string | { [key: string]: string },
        public code: HelperErrorCode,
    ) {
        super('HelperError');
        Error.captureStackTrace(this, this.constructor);
    }
}

interface Req {
    params: { [key: string]: any };
    body: { [key: string]: any };
    query: { [key: string]: any };
}

@Injectable()
export class HelpersService {
    constructor(private readonly dataSource: DataSource) {}

    /**
     * @throws HelperError
     */
    extractEntityId(
        req: Req,
        location: HasParam[1],
    ): { entityId: string; key: string } {
        const regexp = /^(?<location>params|body|query)\.(?<key>.+)$/;
        const match = regexp.exec(location);

        if (!match) {
            throw new HelperError(
                `Invalid location: ${location}. It must match the pattern ${regexp}`,
                HelperErrorCode.INVALID_LOCATION,
            );
        }

        const entityId = req[match.groups.location][match.groups.key] as string;
        return { entityId, key: match.groups.key };
    }

    /**
     * @throws HelperError
     */
    async handleParam(
        entityId: string,
        key: string,
        Entity: HasParam[0],
        userMustOwnModel: HasParam[3],
        userId: string,
    ) {
        if (!isUUID(entityId)) {
            throw new HelperError(
                { [key]: `${Entity.name} not found` },
                HelperErrorCode.ENTITY_NOT_FOUND,
            );
        }

        const EntityRepo = this.dataSource.getRepository(Entity);
        const entity = await EntityRepo.findOne({
            where: { id: entityId },
            // @ts-expect-error: Difficult to add types to Entity.user`
            relations: { user: true },
        });

        if (!entity) {
            throw new HelperError(
                { [key]: `${Entity.name} not found` },
                HelperErrorCode.ENTITY_NOT_FOUND,
            );
        }

        // @ts-expect-error: the entity.user is already checked for null. Pretty difficult to add types to this
        if (userMustOwnModel && entity?.user?.id !== userId) {
            throw new HelperError(
                'You do not have the required permissions to perform to this action',
                HelperErrorCode.NOT_ENOUGH_PERMISSIONS,
            );
        }

        return { entity };
    }
}
