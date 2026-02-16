import {
  IQoreAllowedValue,
  TQoreAppActionFunctionContext,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { freshdeskClient } from '../client';
import { FRESHDESK_CONN_OPTIONS } from '../conn-options';
import { fetchFreshdeskAllowedValues } from './constants';

type TFreshdeskTicket = {
  id: number;
  subject: string;
  description: string;
  priority: number;
  status: number;
  source: number;
};

type TFreshdeskTicketField = {
  id: number;
  name: string;
  choices: { id: number; label: string }[];
};

export const getTicketFields = async (
  token: string,
  subdomain: string
): Promise<{ id: number; name: string }[]> => {
  const data = await freshdeskClient.get<{ id: number; name: string }[]>(
    '/api/v2/admin/ticket_fields',
    {
      token,
      connectionOptions: { subdomain },
    }
  );

  if (!data) {
    throw new Error('Failed to get freshdesk ticket fields');
  }

  return data;
};

export const getFreshdeskTicketField = async (
  fieldId: number,
  token: string,
  subdomain: string
): Promise<TFreshdeskTicketField> => {
  try {
    const data = await freshdeskClient.get<TFreshdeskTicketField>(
      `/api/v2/admin/ticket_fields/${fieldId}`,
      {
        token,
        connectionOptions: { subdomain },
      }
    );

    if (!data) {
      throw new Error('Failed to get freshdesk ticket field');
    }

    return data;
  } catch {
    throw new Error('Failed to get freshdesk ticket field');
  }
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
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;

  if (!token) {
    throw new Error('The token is required to get Freshdesk ticket allowed values');
  }

  if (!subdomain) {
    throw new Error('The subdomain option is required to get Freshdesk ticket allowed values');
  }

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

async function getFreshdeskFieldAllowedValues(
  fieldName: string,
  context: TQoreAppActionFunctionContext<typeof FRESHDESK_CONN_OPTIONS>,
  defaultValues: IQoreAllowedValue[]
): Promise<IQoreAllowedValue[]> {
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;

  if (!token) {
    throw new Error(`The token is required to get Freshdesk ticket ${fieldName} allowed values`);
  }
  if (!subdomain) {
    throw new Error(
      `The subdomain option is required to get Freshdesk ticket ${fieldName} allowed values`
    );
  }

  try {
    const ticketFields = await getTicketFields(token, subdomain);
    const fieldId = ticketFields.find((field) => field.name === fieldName)?.id;
    if (!fieldId) throw new Error(`Failed to get ${fieldName} field id`);

    const field = await getFreshdeskTicketField(fieldId, token, subdomain);
    if (!field.choices) throw new Error(`Failed to get ${fieldName} field choices`);

    return field.choices.map(
      (choice): IQoreAllowedValue => ({
        value: choice.id,
        display_name: choice.label,
      })
    );
  } catch (error) {
    Debugger.log(String(error));

    return defaultValues;
  }
}

export const getFreshdeskTicketStatusAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context?) =>
  await getFreshdeskFieldAllowedValues('status', context!, FreshdeskTicketStatusAllowedValues);

export const getFreshdeskTicketPriorityAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context?) =>
  await getFreshdeskFieldAllowedValues('priority', context!, FreshdeskTicketPriorityAllowedValues);

export const getFreshdeskTicketSourceAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context?) =>
  await getFreshdeskFieldAllowedValues('source', context!, FreshdeskTicketSourceAllowedValues);

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
