import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteOpportunityData = {
  id: string;
  title: string;
  projectedtotal: string;
  expectedclosedate: string;
  probability: string;
  statusref: string;
  entityname: string;
  tranid: string;
  memo: string;
};

const fieldsToFetch = [
  'id',
  'title',
  'projectedtotal',
  'expectedclosedate',
  'probability',
  'statusref',
  'entity.entityid as entityname',
  'tranid',
  'memo',
];

const mapNetSuiteOpportunity = (opportunity: TNetsuiteOpportunityData): IQoreAllowedValue => ({
  value: opportunity.id,
  display_name: opportunity.title || `Opportunity ${opportunity.tranid}`,
  desc:
    `ID: ${opportunity.id}\n\nTitle: ${opportunity.title}\n\n` +
    `Projected Total: ${opportunity.projectedtotal}\n\nExpected Close Date: ${opportunity.expectedclosedate}\n\n` +
    `Probability: ${opportunity.probability}%\n\nStatus: ${opportunity.statusref}\n\n` +
    `Customer: ${opportunity.entityname}\n\nTransaction ID: ${opportunity.tranid}\n\n` +
    `Memo: ${opportunity.memo}`,
});

export const getNetsuiteOpportunityIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error(
      'The token and account_id are required to get NetSuite opportunity allowed values'
    );
  }

  const opportunities = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteOpportunity,
    query:
      `SELECT ${fieldsToFetch.join(',')} FROM transaction WHERE type = 'Opprtnty'` +
      ` ORDER BY transaction.lastmodified DESC`,
  });

  return opportunities;
};
