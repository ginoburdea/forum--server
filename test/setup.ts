import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { validationConfig } from 'src/config/validation';
import {
    BadRequestHttpError,
    UnprocessableEntityHttpError,
} from 'src/dto/httpResponses.dto';
import { expectTypeOf } from 'vitest';
import { expect } from 'vitest';

expect.extend({
    toMatchSchema: (
        received: object,
        expectedSchema: ClassConstructor<any>,
    ) => {
        const classObj = plainToInstance(expectedSchema, received);
        const errors = validateSync(classObj, validationConfig);

        if (errors.length > 0) {
            return {
                message: () =>
                    `expected ${JSON.stringify(received)} to match schema ${expectedSchema.name}`,
                pass: false,
            };
        }

        return {
            pass: true,
            message: () => '',
        };
    },
});

expect.extend({
    toHaveValidationErrors: (
        received: { [key: string]: any },
        onFields: string[] = [],
    ) => {
        try {
            expect(received.statusCode).toEqual(400);
        } catch (error) {
            try {
                expect(received.statusCode).toEqual(422);
            } catch (error) {
                return {
                    pass: false,
                    message: () =>
                        `expected ${JSON.stringify(received)}.statusCode to equal 400 or 422`,
                };
            }
        }

        const Error =
            received.statusCode === 400
                ? BadRequestHttpError
                : UnprocessableEntityHttpError;
        expect(received).toMatchSchema(Error);

        const notFoundKeys = [];

        const receivedKeys = Object.keys((received as Error).message);
        for (const key of onFields) {
            if (!receivedKeys.includes(key)) {
                notFoundKeys.push(key);
            }
        }

        if (notFoundKeys.length > 0) {
            return {
                message: () =>
                    `expected to find errors on keys ${JSON.stringify(notFoundKeys)} but they were not found on the given object: ${JSON.stringify(
                        (received as Error).message,
                    )}`,
                pass: false,
            };
        }

        return {
            pass: true,
            message: () => '',
        };
    },
});

expect.extend({
    toBeSorted: (
        received: object[],
        filter: { byKey: string; order: 'asc' | 'des' },
    ) => {
        expectTypeOf(filter.byKey).toBeString();
        expect(['asc', 'desc']).includes(filter.order);

        expectTypeOf(received).toBeArray();
        for (const item of received) {
            expectTypeOf(item).toBeObject();
        }

        const receivedCopy = received.map((received) => received[filter.byKey]);
        const expected = receivedCopy.sort();

        try {
            expect(receivedCopy).toStrictEqual(expected);
        } catch (err) {
            return {
                message: () =>
                    `expected array to be sorted ${filter.order} by key ${filter.byKey}`,
                pass: false,
            };
        }

        return {
            pass: true,
            message: () => '',
        };
    },
});
