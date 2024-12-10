import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getTicketMetricIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'ticket_metrics',
  'url',
  {},
  (entity: { id: number; url: string; ticket_id: string }) => {
    return `Id: ${entity.id}\n\nLink: [View in Zendesk]${entity.url}\n\nTicket Id: ${entity.ticket_id}`;
  }
);
