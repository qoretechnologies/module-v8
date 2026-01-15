/**
 * New Time Off Trigger
 *
 * Triggers when a new approved time off entry appears.
 * Uses the Who's Out endpoint to detect approved time off.
 *
 * @see https://documentation.bamboohr.com/reference/get-a-list-of-who-is-out-1
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHRWhosOutEntry } from '../types';

const options = {} satisfies TQoreOptions;

// Fetch who's out entries
const fetchWhosOut = async (api_key: string, company_domain: string): Promise<IBambooHRWhosOutEntry[]> => {
  // Get entries from today to 30 days in the future
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);

  const params: Record<string, string> = {
    start: today.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };

  const response = await bambooHRClient.get<IBambooHRWhosOutEntry[]>('time_off/whos_out', {
    token: api_key,
    connectionOptions: { company_domain },
    params,
  });

  return (response || []).slice(0, DEFAULT_TRIGGER_POLL_ITEM_LIMIT);
};

// Transform entry to consistent event format with unique ID
const transformEntry = (entry: IBambooHRWhosOutEntry) => {
  // Create a unique ID from the entry data
  const uniqueId =
    entry.type === 'holiday'
      ? `holiday_${entry.holidayName}_${entry.start}`
      : `timeoff_${entry.employeeId}_${entry.start}_${entry.end}`;

  return {
    id: uniqueId,
    type: entry.type,
    employee_id: entry.employeeId || null,
    name: entry.type === 'holiday' ? entry.holidayName : entry.name,
    start_date: entry.start,
    end_date: entry.end,
  };
};

const NewTimeOffTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BAMBOOHR_APP_NAME,
  action: 'new_time_off',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { api_key, company_domain } = getQoreContextRequiredValues({
      context,
      connectionFields: ['api_key', 'company_domain'],
      ErrorClass: BambooHRError,
    });

    const getItems = async () => {
      const entries = await fetchWhosOut(api_key, company_domain);
      return entries.map(transformEntry);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'bamboohr_new_time_off',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { api_key, company_domain } = getQoreContextRequiredValues({
      context,
      connectionFields: ['api_key', 'company_domain'],
      ErrorClass: BambooHRError,
    });

    const entries = await fetchWhosOut(api_key, company_domain);

    if (entries.length === 0) {
      // Return sample data if no entries found
      return {
        id: 'timeoff_456_2026-02-01_2026-02-05',
        type: 'timeOff',
        employee_id: '456',
        name: 'John Doe',
        start_date: '2026-02-01',
        end_date: '2026-02-05',
      };
    }

    return transformEntry(entries[0]);
  },
  event_info: {
    desc: 'BambooHR New Time Off Event (Approved)',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        type: { type: 'string' },
        employee_id: { type: 'softstring' },
        name: { type: 'softstring' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
      },
    },
  },
});

export default NewTimeOffTrigger;
