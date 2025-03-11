import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getHubspotPipelineAllowedValues } from './constants';

export const getHubspotLeadPipelineAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    console.error('The token is required to get Hubspot lead pipeline allowed values');

    return [];
  }

  return await getHubspotPipelineAllowedValues(token!, 'leads');
};
