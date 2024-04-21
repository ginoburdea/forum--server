import { isNumberString } from 'class-validator';

export const numberStringToNumber = ({ value }) => {
    return isNumberString(value) ? Number(value) : value;
};
