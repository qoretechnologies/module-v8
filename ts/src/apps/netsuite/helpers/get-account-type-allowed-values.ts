import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { fetchNetsuiteAllowedValues } from './constants';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';

type TNetsuiteAccountTypeData = {
  id: string;
  longname: string;
  defaultcashflowratetype: string;
};

const mapNetSuiteAccountType = (accountType: TNetsuiteAccountTypeData): IQoreAllowedValue => {
  return {
    value: { id: accountType.id },
    display_name: accountType.longname,
    desc:
      `ID: ${accountType.id}\n\nName: ${accountType.longname}\n\n` +
      `Cash Flow Rate Type: ${accountType.defaultcashflowratetype}`,
  };
};

export const getNetsuiteAccountTypeAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error(
      'The token and account_id are required to get NetSuite account type allowed values'
    );
  }

  const subsidiaries = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteAccountType,
    query: `SELECT * FROM accounttype`,
  });

  return subsidiaries;
};
