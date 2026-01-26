import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooPartnerCategoryFields = ['id', 'name', 'color', 'parent_id'] as const;

type TOdooPartnerCategory = { id: number } & {
  [K in (typeof OdooPartnerCategoryFields)[number]]: any;
};

const mapOdooPartnerCategoryToAllowedValue = (
  category: TOdooPartnerCategory
): IQoreAllowedValue<number> => ({
  value: category.id,
  display_name: category.name,
  desc: `ID: ${category.id}${category.parent_id ? `\nParent: ${category.parent_id[1]}` : ''}`,
});

export const getOdooPartnerCategoryAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooPartnerCategory>({
    subdomain,
    username,
    password,
    model: 'res.partner.category',
    fields: [...OdooPartnerCategoryFields],
    mapItemToAllowedValue: mapOdooPartnerCategoryToAllowedValue,
  });
};
