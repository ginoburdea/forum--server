import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { validationConfig } from 'src/config/validation';
import { ValidationHttpError } from 'src/dto/httpResponses';
import { expect } from 'vitest';

expect.extend({
    toMatchSchema: (
        received: object,
        expectedSchema: ClassConstructor<any>,
    ) => {
        const classObj = plainToClass(expectedSchema, received);
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
        };
    },
});

expect.extend({
    toHaveValidationErrors: (received: object, onFields: string[] = []) => {
        expect(received).toMatchSchema(ValidationHttpError);

        const notFoundKeys = [];

        const receivedKeys = Object.keys(
            (received as ValidationHttpError).message,
        );
        for (const key of onFields) {
            if (!receivedKeys.includes(key)) {
                notFoundKeys.push(key);
            }
        }

        if (notFoundKeys.length > 0) {
            return {
                message: () =>
                    `expected to find errors on keys ${JSON.stringify(notFoundKeys)} but they were not found on the given object: ${JSON.stringify(
                        (received as ValidationHttpError).message,
                    )}`,
                pass: false,
            };
        }

        return {
            pass: true,
        };
    },
});
