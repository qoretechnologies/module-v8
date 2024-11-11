import { IQoreRestGetAllowedValues } from '../../../global/models/qore';

export const getOrganizationIdAllowedValues = {
  method: 'GET',
  path: 'organizations',
  values: 'body.organizations.id',
} satisfies IQoreRestGetAllowedValues;
