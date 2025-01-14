import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import {
  fetchSuiteQlData,
  NETSUITE_ALLOWED_VALUES_FETCH_DELAY,
  NETSUITE_ALLOWED_VALUES_TIMEOUT,
} from './constants';

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

const TOTAL_LIMIT = 500;

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
  const {
    conn_opts: { token, account_id },
  } = context;

  const journalEntries: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let offset = 0;

  try {
    let hasMore = true;

    while (hasMore && journalEntries.length < TOTAL_LIMIT) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite journal entries fetching timeout');

        break;
      }

      const { items: fetchedJournalEntries, hasMore: more } = await fetchSuiteQlData({
        accountId: account_id,
        token,
        offset,
        q: `SELECT ${fieldsToFetch.join(',')} FROM transaction WHERE type = 'Journal' ORDER BY createddate DESC`,
      });

      journalEntries.push(...fetchedJournalEntries.map(mapNetSuiteJournalEntry));

      hasMore = more;
      offset += fetchedJournalEntries.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }

    return journalEntries;
  } catch (error) {
    Debugger.log('Error fetching Netsuite journal entries:', error);

    return journalEntries;
  }
};
