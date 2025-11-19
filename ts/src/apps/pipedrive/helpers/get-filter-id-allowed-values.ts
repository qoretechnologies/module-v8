import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveFilterData = {
  id: string;
  name: string;
  type: string;
  add_time?: string;
};

const mapPipedriveFilter = (filter: TPipedriveFilterData): IQoreAllowedValue<string> => ({
  display_name: filter.name,
  value: filter.id,
  desc: `Type: ${filter.type}\n\nCreated: ${filter.add_time}\n\n`,
});

const createPipedriveFilterAllowedValuesFunction = (
  type: 'deals' | 'leads' | 'org' | 'people' | 'products' | 'activity' | 'projects'
): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> => {
  return async (context): Promise<IQoreAllowedValue<string>[]> => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error('The token is required to get Pipedrive filter allowed values');
    }

    const filters = await fetchPipedriveAllowedValues<TPipedriveFilterData>({
      token,
      mapItemToAllowedValue: mapPipedriveFilter,
      params: { type },
      path: 'v1/filters',
    });

    return filters;
  };
};

export const getPipedriveDealFilterIdAllowedValues =
  createPipedriveFilterAllowedValuesFunction('deals');

export const getPipedriveLeadFilterIdAllowedValues =
  createPipedriveFilterAllowedValuesFunction('leads');

export const getPipedriveOrganizationFilterIdAllowedValues =
  createPipedriveFilterAllowedValuesFunction('org');

export const getPipedrivePersonFilterIdAllowedValues =
  createPipedriveFilterAllowedValuesFunction('people');

export const getPipedriveProductFilterIdAllowedValues =
  createPipedriveFilterAllowedValuesFunction('products');

export const getPipedriveActivityFilterIdAllowedValues =
  createPipedriveFilterAllowedValuesFunction('activity');

export const getPipedriveProjectFilterIdAllowedValues =
  createPipedriveFilterAllowedValuesFunction('projects');
