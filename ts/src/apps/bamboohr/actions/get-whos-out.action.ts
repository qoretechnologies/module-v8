/**
 * Get Who's Out Action
 *
 * Retrieves a summary of employees who are out (vacation, sick leave, etc.)
 * and company holidays for a given date range.
 *
 * @see https://documentation.bamboohr.com/reference/get-a-list-of-who-is-out-1
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHRWhosOutEntry } from '../types';

const action = 'get_whos_out';

const options = {
  start_date: {
    type: 'date',
    required: false,
  },
  end_date: {
    type: 'date',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: {
    type: 'hash',
    fields: {
      type: {
        type: 'string',
        short_desc: 'Entry type: "timeOff" or "holiday"',
      },
      employee_id: {
        type: 'softstring',
        short_desc: 'Employee ID (for timeOff entries)',
      },
      name: {
        type: 'softstring',
        short_desc: 'Employee name or holiday name',
      },
      start: {
        type: 'string',
        short_desc: 'Start date (YYYY-MM-DD)',
      },
      end: {
        type: 'string',
        short_desc: 'End date (YYYY-MM-DD)',
      },
    },
  },
} satisfies TQoreResponseType;

const getWhosOut = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { api_key, company_domain } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['api_key', 'company_domain'],
      ErrorClass: BambooHRError,
    });

    // Build query params
    const params: Record<string, string> = {};

    if (obj?.start_date) {
      // Convert date to YYYY-MM-DD format
      const startDate = new Date(obj.start_date as string);
      params.start = startDate.toISOString().split('T')[0];
    }

    if (obj?.end_date) {
      const endDate = new Date(obj.end_date as string);
      params.end = endDate.toISOString().split('T')[0];
    }

    try {
      const response = await bambooHRClient.get<IBambooHRWhosOutEntry[]>('time_off/whos_out', {
        token: api_key,
        connectionOptions: { company_domain },
        params,
      });

      // Transform response to consistent format
      return (response || []).map((entry) => ({
        type: entry.type,
        employee_id: entry.employeeId || null,
        name: entry.type === 'holiday' ? entry.holidayName : entry.name,
        start: entry.start,
        end: entry.end,
      }));
    } catch (error) {
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: responseType,
});

export default getWhosOut;
