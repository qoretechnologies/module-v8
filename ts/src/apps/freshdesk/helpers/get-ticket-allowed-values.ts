import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { FRESHDESK_CONN_OPTIONS } from '../constants';
import { fetchFreshdeskAllowedValues } from './constants';

type TFreshdeskTicket = {
  id: number;
  subject: string;
  description: string;
  priority: number;
  status: number;
  source: number;
};

const mapFreshdeskTicket = (ticket: TFreshdeskTicket): IQoreAllowedValue => ({
  value: ticket.id.toString(),
  display_name: ticket.subject,
  desc:
    `ID: ${ticket.id}\n\nSubject: ${ticket.subject}\n\nDescription: ${ticket.description}\n\n` +
    `Priority: ${getFreshdeskTicketPriorityName(ticket.priority)}\n\n` +
    `Status: ${getFreshdeskTicketStatusName(ticket.status)}\n\n` +
    `Source: ${getFreshdeskTicketSourceName(ticket.source)}`,
});

export const getFreshdeskTicketIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, subdomain },
  } = context;

  const tickets = await fetchFreshdeskAllowedValues<TFreshdeskTicket>({
    subdomain,
    token,
    path: '/api/v2/tickets',
    mapItemToAllowedValue: mapFreshdeskTicket,
  });

  return tickets;
};

const getFreshdeskTicketStatusName = (id: number): string => {
  return (
    FreshdeskTicketStatusAllowedValues.find((status) => status.value === id)?.display_name ||
    String(id)
  );
};

const getFreshdeskTicketPriorityName = (id: number): string => {
  return (
    FreshdeskTicketPriorityAllowedValues.find((priority) => priority.value === id)?.display_name ||
    String(id)
  );
};

const getFreshdeskTicketSourceName = (id: number): string => {
  return (
    FreshdeskTicketSourceAllowedValues.find((source) => source.value === id)?.display_name ||
    String(id)
  );
};

export const FreshdeskTicketStatusAllowedValues = [
  {
    value: 2,
    display_name: 'Open',
  },
  {
    value: 3,
    display_name: 'Pending',
  },
  {
    value: 4,
    display_name: 'Resolved',
  },
  {
    value: 5,
    display_name: 'Closed',
  },
] satisfies IQoreAllowedValue[];

export const FreshdeskTicketPriorityAllowedValues = [
  {
    value: 1,
    display_name: 'Low',
  },
  {
    value: 2,
    display_name: 'Medium',
  },
  {
    value: 3,
    display_name: 'High',
  },
  {
    value: 4,
    display_name: 'Urgent',
  },
] satisfies IQoreAllowedValue[];

export const FreshdeskTicketSourceAllowedValues = [
  {
    value: 1,
    display_name: 'Email',
  },
  {
    value: 2,
    display_name: 'Portal',
  },
  {
    value: 3,
    display_name: 'Phone',
  },
  {
    value: 7,
    display_name: 'Chat',
  },
  {
    value: 9,
    display_name: 'Feedback Widget',
  },
  {
    value: 10,
    display_name: 'Outbound Email',
  },
] satisfies IQoreAllowedValue[];
