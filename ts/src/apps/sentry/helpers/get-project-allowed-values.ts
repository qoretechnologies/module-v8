import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SentryError } from '../constants';
import { fetchSentryAllowedValues } from './constants';

type TSentryProject = {
  id: string;
  name: string;
};

const mapSentryProjectToAllowedValue = (item: TSentryProject): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: item.name,
  };
};

export const getSentryProjectAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, organization } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    ErrorClass: SentryError,
  });

  return await fetchSentryAllowedValues<TSentryProject>({
    token,
    path: `/api/0/organizations/${organization}/projects/`,
    mapItemToAllowedValue: mapSentryProjectToAllowedValue,
  });
};
