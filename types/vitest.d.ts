import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

interface CustomMatchers<R = unknown> {
    toMatchSchema: (expectedSchema: ClassConstructor<any>) => R;
    toHaveValidationErrors: (onFields: string[]) => R;
    toBeSorted: (filter: { byKey: string; order: 'asc' | 'desc' }) => R;
}

declare module 'vitest' {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
