import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedriveDealData = {
  id: string;
  title: string;
  value: number;
  currency: string;
  status: string;
  org_name?: string;
  person_name?: string;
};

const mapPipedriveDeal = (deal: TPipedriveDealData): IQoreAllowedValue<string> => ({
  display_name: deal.title,
  value: deal.id,
  desc:
    `Value: ${deal.value} ${deal.currency}\n\n` +
    `Organization ${deal.org_name}\n\n` +
    `Person: ${deal.person_name}\n\n` +
    `Status: ${deal.status}`,
});

export const getPipedriveDealIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive deal allowed values');
  }

  const deals = await fetchPipedriveAllowedValues<TPipedriveDealData>({
    token,
    mapItemToAllowedValue: mapPipedriveDeal,
    path: '/deals',
  });

  return deals;
};
