import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CalendlyError } from '../constants';
import { fetchCalendlyAllowedValues, fetchCalendlyData } from './constants';

type TCalendlyItem = {
  role: string;
  user: {
    avatar_url: string;
    email: string;
    name: string;
    uri: string;
  };
};

const mapCalendlyItemToAllowedValue = (item: TCalendlyItem): IQoreAllowedValue<string> => {
  return {
    value: item.user.uri,
    display_name: item.user.name,
    desc: `Role: ${item.role}\nEmail: ${item.user.email}`,
  };
};

export const getCalendlyOrganizationMemberAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: CalendlyError,
  });

  const user = await fetchCalendlyData<{ current_organization: string }>({
    token,
    object: 'resource',
    path: `users/me`,
  });

  return await fetchCalendlyAllowedValues<TCalendlyItem>({
    token,
    path: `organization_memberships`,
    object: 'collection',
    params: {
      organization: user.current_organization,
    },
    mapItemToAllowedValue: mapCalendlyItemToAllowedValue,
  });
};
