import { IQoreRestGetAllowedValues } from '../../../global/models/qore';

export const getAgentIdAllowedValues = {
  method: 'GET',
  path: 'users?role=agent',
  values: 'body.users.id',
} satisfies IQoreRestGetAllowedValues;
