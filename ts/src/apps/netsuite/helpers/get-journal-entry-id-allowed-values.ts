import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteJournalEntryData = {
  id: string;
  foreigntotal: string;
  createddate: string;
  status: string;
  tranid: string;
  transactionnumber: string;
  memo: string;
  trandisplayname: string;
};

const fieldsToFetch = [
  'id',
  'foreigntotal',
  'createddate',
  'status',
  'tranid',
  'transactionnumber',
  'memo',
  'trandisplayname',
];

const mapNetSuiteJournalEntry = (journalEntry: TNetsuiteJournalEntryData): IQoreAllowedValue => ({
  value: journalEntry.id,
  display_name: journalEntry.trandisplayname,
  desc:
    `ID: ${journalEntry.id}\n\nForeign Total: ${journalEntry.foreigntotal}\n\n` +
    `Created Date: ${journalEntry.createddate}\n\nStatus: ${journalEntry.status}\n\n` +
    `Transaction ID: ${journalEntry.tranid}\n\nTransaction Number: ${journalEntry.transactionnumber}\n\n` +
    `Memo: ${journalEntry.memo}`,
});

export const getNetsuiteJournalEntryIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error(
      'The token and account_id are required to get NetSuite journal entry allowed values'
    );
  }

  const journalEntries = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteJournalEntry,
    query: `SELECT ${fieldsToFetch.join(',')} FROM transaction WHERE type = 'Journal' ORDER BY createddate DESC`,
  });

  return journalEntries;
};
