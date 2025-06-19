import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooLostReasonFields = ['id', 'display_name'] as const;

type TOdooLostReason = { id: number } & {
  [K in (typeof OdooLostReasonFields)[number]]: string;
};

const mapOdooLostReasonToAllowedValue = (
  lostReason: TOdooLostReason
): IQoreAllowedValue<number> => ({
  value: lostReason.id,
  display_name: lostReason.display_name,
});

export const getOdooLostReasonIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooLostReason>({
    subdomain,
    username,
    password,
    model: 'crm.lost.reason',
    fields: [...OdooLostReasonFields],
    mapItemToAllowedValue: mapOdooLostReasonToAllowedValue,
  });
};
