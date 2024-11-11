import { IQoreRestGetAllowedValues } from '../../../global/models/qore';

export const getTicketMetricIdAllowedValues = {
  method: 'GET',
  path: 'ticket_metrics',
  values: 'body.ticket_metrics.id',
} satisfies IQoreRestGetAllowedValues;
