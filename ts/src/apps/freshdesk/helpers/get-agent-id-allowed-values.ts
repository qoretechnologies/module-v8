import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { FRESHDESK_CONN_OPTIONS } from '../constants';
import { fetchFreshdeskAllowedValues } from './constants';

type TFreshdeskAgent = {
  id: number;
  contact: {
    name: string;
    email: string;
    phone: string;
    job_title: string;
  };
};

const mapFreshdeskAgent = (agent: TFreshdeskAgent): IQoreAllowedValue => ({
  value: agent.id.toString(),
  display_name: agent.contact.name || agent.contact.email,
  desc:
    `ID: ${agent.id}\n\nName: ${agent.contact.name}\n\nEmail: ${agent.contact.email}\n\n` +
    `Phone: ${agent.contact.phone}\n\nJob Title: ${agent.contact.job_title}`,
});

export const getFreshdeskAgentIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;

  if (!token) {
    throw new Error('The token is required to get Freshdesk agent allowed values');
  }

  if (!subdomain) {
    throw new Error('The subdomain option is required to get Freshdesk agent allowed values');
  }

  const agents = await fetchFreshdeskAllowedValues<TFreshdeskAgent>({
    subdomain,
    token,
    path: '/api/v2/agents',
    mapItemToAllowedValue: mapFreshdeskAgent,
  });

  return agents;
};
