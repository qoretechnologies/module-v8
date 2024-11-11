import { IQoreRestGetAllowedValues } from '../../../global/models/qore';

export const getUserIdAllowedValues = {
  method: 'GET',
  path: 'users',
  values: 'body.users.id',
} satisfies IQoreRestGetAllowedValues;
