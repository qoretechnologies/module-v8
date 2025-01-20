import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getTicketMetricIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'ticket_metrics',
  'id',
  {},
  (entity: { id: number; created_at: string; ticket_id: string }) => {
    return `Id: ${entity.id}\n\nTicket Id: ${entity.ticket_id}\n\nCreated At: ${entity.created_at}`;
  }
);
