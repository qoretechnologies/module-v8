import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getTicketMetricIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'ticket_metrics',
  'url'
);
