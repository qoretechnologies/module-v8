import { IQoreRestGetAllowedValues } from '../../../global/models/qore';

export const getGroupIdAllowedValues = {
  method: 'GET',
  path: 'groups',
  values: 'body.groups.id',
} satisfies IQoreRestGetAllowedValues;
