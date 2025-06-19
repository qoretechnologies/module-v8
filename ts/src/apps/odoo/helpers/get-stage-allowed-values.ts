import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooStageFields = ['id', 'display_name'] as const;

type TOdooStage = { id: number } & {
  [K in (typeof OdooStageFields)[number]]: string;
};

const mapOdooStageToAllowedValue = (stage: TOdooStage): IQoreAllowedValue<number> => ({
  value: stage.id,
  display_name: stage.display_name,
});

export const getOdooStageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooStage>({
    subdomain,
    username,
    password,
    model: 'crm.stage',
    fields: [...OdooStageFields],
    mapItemToAllowedValue: mapOdooStageToAllowedValue,
  });
};
