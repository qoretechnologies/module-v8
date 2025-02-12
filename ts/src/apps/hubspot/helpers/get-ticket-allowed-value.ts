import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotTicket = {
  id: string;
  properties: {
    hs_ticket_priority: string;
    subject: string;
    content: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotTicket = (ticket: THubspotTicket): IQoreAllowedValue<string> => ({
  value: ticket.id,
  display_name: ticket.properties.subject,
  desc:
    `Priority: ${ticket.properties.hs_ticket_priority}\n\nContent: ${ticket.properties.content}\n\n` +
    `Archived: ${ticket.archived}\n\nCreated at: ${ticket.createdAt}\n\nUpdated at: ${ticket.updatedAt}`,
});

export const getHubspotTicketAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot ticket allowed values');
  }

  const tickets = await fetchHubspotAllowedValues<THubspotTicket>({
    token,
    object: 'tickets',
    mapItemToAllowedValue: mapHubspotTicket,
  });

  return tickets;
};
