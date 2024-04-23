import { MoreThan, MoreThanOrEqual, LessThan, LessThanOrEqual } from 'typeorm';
import { format } from 'date-fns';

export enum EDateType {
    Date = 'yyyy-MM-dd',
    DateTime = 'yyyy-MM-dd kk:mm:ss.SSS',
}

export const MoreThanDate = (
    date: Date,
    type: EDateType = EDateType.DateTime,
) => MoreThan(format(date, type));

export const MoreThanOrEqualDate = (
    date: Date,
    type: EDateType = EDateType.DateTime,
) => MoreThanOrEqual(format(date, type));

export const LessThanDate = (
    date: Date,
    type: EDateType = EDateType.DateTime,
) => LessThan(format(date, type));

export const LessThanOrEqualDate = (
    date: Date,
    type: EDateType = EDateType.DateTime,
) => LessThanOrEqual(format(date, type));
