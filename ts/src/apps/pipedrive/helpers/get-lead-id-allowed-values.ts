import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveLeadData = {
  id: string;
  title: string;
  value: {
    amount: number;
    currency: string;
  };
  owner_name?: string;
  source_name: string;
};

const mapPipedriveLead = (lead: TPipedriveLeadData): IQoreAllowedValue<string> => ({
  display_name: lead.title,
  value: lead.id,
  desc:
    `Source: ${lead.source_name}\n\n` +
    `Owner: ${lead.owner_name}` +
    (lead.value ? `\n\nValue: ${lead.value.amount} ${lead.value.currency}` : ''),
});

export const getPipedriveLeadIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive lead allowed values');
  }

  const leads = await fetchPipedriveAllowedValues<TPipedriveLeadData>({
    token,
    mapItemToAllowedValue: mapPipedriveLead,
    path: 'v1/leads',
  });

  return leads;
};
