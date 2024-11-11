import { IQoreRestGetAllowedValues } from '../../../global/models/qore';

export const getTicketIdAllowedValues = {
  method: 'GET',
  path: 'tickets',
  values: 'body.tickets.id',
} satisfies IQoreRestGetAllowedValues;
