import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

interface CustomMatchers<R = unknown> {
    toMatchSchema: (expectedSchema: ClassConstructor<any>) => R;
    toHaveValidationErrors: (onFields: string[]) => R;
}

declare module 'vitest' {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
