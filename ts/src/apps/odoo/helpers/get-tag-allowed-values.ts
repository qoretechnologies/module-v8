import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooTagFields = ['id', 'name'] as const;

type TOdooTag = { id: number } & {
  [K in (typeof OdooTagFields)[number]]: string;
};

const mapOdooTagToAllowedValue = (tag: TOdooTag): IQoreAllowedValue<number> => ({
  value: tag.id,
  display_name: tag.name,
});

export const getOdooLeadTagAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooTag>({
    subdomain,
    username,
    password,
    model: 'crm.tag',
    fields: [...OdooTagFields],
    mapItemToAllowedValue: mapOdooTagToAllowedValue,
  });
};
