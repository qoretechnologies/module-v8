import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './constants';

type TPipedriveOrganizationData = {
  id: string;
  name: string;
  address?: string;
  cc_email?: string;
  owner_name?: string;
};

const mapPipedriveOrganization = (org: TPipedriveOrganizationData): IQoreAllowedValue<string> => ({
  display_name: org.name,
  value: org.id,
  desc:
    (org.address ? `Address: ${org.address}\n\n` : '') +
    (org.cc_email ? `Email: ${org.cc_email}\n\n` : '') +
    (org.owner_name ? `Owner: ${org.owner_name}` : ''),
});

export const getPipedriveOrganizationIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive organization allowed values');
  }

  const organizations = await fetchPipedriveAllowedValues<TPipedriveOrganizationData>({
    token,
    mapItemToAllowedValue: mapPipedriveOrganization,
    path: '/organizations',
  });

  return organizations;
};
