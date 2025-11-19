import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveOrganizationData = {
  id: number;
  name: string;
};

const mapPipedriveOrganization = (org: TPipedriveOrganizationData): IQoreAllowedValue<number> => ({
  display_name: org.name,
  value: org.id,
});

export const getPipedriveOrganizationIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context): Promise<IQoreAllowedValue<number>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive organization allowed values');
  }

  const organizations = await fetchPipedriveAllowedValues<TPipedriveOrganizationData>({
    token,
    mapItemToAllowedValue: mapPipedriveOrganization,
    path: 'organizations',
  });

  return organizations;
};
