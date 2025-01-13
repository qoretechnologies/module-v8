import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { NETSUITE_ALLOWED_VALUES_FETCH_DELAY, NETSUITE_ALLOWED_VALUES_TIMEOUT } from './constants';

const DEFAULT_LIMIT = 1000;

type TNetsuiteJournalEntryData = {
  id: string;
  tranId: string;
  tranDate: string;
  memo: string;
};

const fetchNetsuiteJournalEntries = async ({
  accountId,
  token,
  offset,
}: {
  accountId: string;
  token: string;
  offset: number;
}): Promise<{ journalEntries: TNetsuiteJournalEntryData[]; count: number; hasMore: boolean }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/services/rest/record/v1/journalEntry`,
      params: {
        offset: offset.toString(),
        limit: DEFAULT_LIMIT.toString(),
      },
    },
    { endpointId: 'NetSuite', url: `https://${accountId}.suitetalk.api.netsuite.com` }
  );

  const { items: journalEntries, count, hasMore } = data;

  return { journalEntries, count, hasMore };
};

const mapNetSuiteJournalEntry = (journalEntry: TNetsuiteJournalEntryData): IQoreAllowedValue => ({
  value: journalEntry.id,
  display_name: `${journalEntry.tranId}  - ${journalEntry.tranDate}`,
  desc:
    `ID: ${journalEntry.id}\n\nTransaction ID: ${journalEntry.tranId}\n\n` +
    `Transaction Date: ${journalEntry.tranDate}\n\nMemo: ${journalEntry.memo}`,
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

    while (hasMore) {
      if (Date.now() - startTime > NETSUITE_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('NetSuite journal entries fetching timeout');

        break;
      }

      const { journalEntries: fetchedJournalEntries, hasMore: more } =
        await fetchNetsuiteJournalEntries({
          accountId: account_id,
          token,
          offset,
        });

      journalEntries.push(...fetchedJournalEntries.map(mapNetSuiteJournalEntry));

      hasMore = more;
      offset += fetchedJournalEntries.length;

      if (hasMore) {
        await delay(NETSUITE_ALLOWED_VALUES_FETCH_DELAY);
      }
    }
  } catch (error) {
    Debugger.log('Error fetching Netsuite journal entries:', error);

    return journalEntries;
  }
};
