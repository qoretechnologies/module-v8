import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MAUTIC_CONN_OPTIONS } from '../constants';
import { mauticClient } from '../client';
import { TMauticCompany } from '../response-types';

const mapMauticCompanyToAllowedValue = (item: TMauticCompany): IQoreAllowedValue<number> => {
  const companyName = item.fields?.all?.companyname as string || '';
  const companyEmail = item.fields?.all?.companyemail as string || '';

  return {
    value: item.id,
    display_name: companyName || `Company ${item.id}`,
    desc: companyEmail ? `Email: ${companyEmail}` : `ID: ${item.id}`,
  };
};

export const getMauticCompaniesAllowedValues: TQoreGetAllowedValuesFunction<
  typeof MAUTIC_CONN_OPTIONS,
  number
> = async (context) => {
  const { instance_url, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['instance_url', 'username', 'password'],
  });

  return await mauticClient.fetchAllowedValues<TMauticCompany>({
    path: 'companies',
    connectionOptions: { instance_url, username, password },
    itemsPath: 'companies',
    mapItemToAllowedValue: mapMauticCompanyToAllowedValue,
  });
};
