import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedriveLeadSourceData = {
  name: string;
};

const mapPipedriveLeadSource = (source: TPipedriveLeadSourceData): IQoreAllowedValue<string> => ({
  display_name: source.name,
  value: source.name,
});

export const getPipedriveLeadSourceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive lead source allowed values');
  }

  const leadSources = await fetchPipedriveAllowedValues<TPipedriveLeadSourceData>({
    token,
    mapItemToAllowedValue: mapPipedriveLeadSource,
    path: '/leadSources',
  });

  return leadSources;
};
