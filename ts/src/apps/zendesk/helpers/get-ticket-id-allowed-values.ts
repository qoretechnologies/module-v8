import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getTicketIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'tickets',
  'subject',
  {},
  (entity: { id: number; subject: string; description: string; url: string; priority: string }) => {
    return (
      `Id: ${entity.id}\n\nSubject: ${entity.subject}\n\n` +
      `Priority: ${entity.priority}\n\n` +
      `Description: ${entity.description}\n\nLink: [View in Zendesk]${entity.url}`
    );
  }
);
