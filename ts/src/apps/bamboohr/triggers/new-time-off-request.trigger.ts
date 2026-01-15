/**
 * New Time Off Request Trigger
 *
 * Triggers when a new time off request is submitted.
 * Uses polling to detect newly created requests with status "requested".
 *
 * @see https://documentation.bamboohr.com/reference/time-off-get-time-off-requests-2
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHRTimeOffRequest } from '../types';

const options = {
  employee_id: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

// Fetch time off requests helper
const fetchTimeOffRequests = async (
  api_key: string,
  company_domain: string,
  employeeId?: string
): Promise<IBambooHRTimeOffRequest[]> => {
  // Get requests from the last 30 days to today + 365 days
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 365);

  const params: Record<string, string> = {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
    status: 'requested', // Only get pending requests
  };

  if (employeeId) {
    params.employeeId = employeeId;
  }

  const response = await bambooHRClient.get<IBambooHRTimeOffRequest[]>('time_off/requests', {
    token: api_key,
    connectionOptions: { company_domain },
    params,
  });

  return (response || []).slice(0, DEFAULT_TRIGGER_POLL_ITEM_LIMIT);
};

// Transform request to consistent event format
const transformRequest = (request: IBambooHRTimeOffRequest) => ({
  id: request.id,
  employee_id: request.employeeId,
  employee_name: request.name,
  start_date: request.start,
  end_date: request.end,
  status: request.status?.status,
  status_changed_at: request.status?.lastChanged || null,
  type_id: request.type?.id,
  type_name: request.type?.name,
  amount: request.amount?.amount || null,
  amount_unit: request.amount?.unit || null,
  employee_notes: request.notes?.employee || null,
});

const NewTimeOffRequestTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BAMBOOHR_APP_NAME,
  action: 'new_time_off_request',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { api_key, company_domain } = getQoreContextRequiredValues({
      context,
      connectionFields: ['api_key', 'company_domain'],
      ErrorClass: BambooHRError,
    });

    const employeeId = context.opts?.employee_id as string | undefined;

    const getItems = async () => {
      const requests = await fetchTimeOffRequests(api_key, company_domain, employeeId);
      return requests.map(transformRequest);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'bamboohr_new_time_off_request',
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

    const employeeId = context.opts?.employee_id as string | undefined;
    const requests = await fetchTimeOffRequests(api_key, company_domain, employeeId);

    if (requests.length === 0) {
      // Return sample data if no requests found
      return {
        id: '123',
        employee_id: '456',
        employee_name: 'John Doe',
        start_date: '2026-02-01',
        end_date: '2026-02-05',
        status: 'requested',
        status_changed_at: '2026-01-14T10:00:00Z',
        type_id: '1',
        type_name: 'Vacation',
        amount: '5',
        amount_unit: 'days',
        employee_notes: 'Family vacation',
      };
    }

    return transformRequest(requests[0]);
  },
  event_info: {
    desc: 'BambooHR New Time Off Request Event',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        employee_id: { type: 'string' },
        employee_name: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
        status: { type: 'string' },
        status_changed_at: { type: 'softstring' },
        type_id: { type: 'string' },
        type_name: { type: 'string' },
        amount: { type: 'softstring' },
        amount_unit: { type: 'softstring' },
        employee_notes: { type: 'softstring' },
      },
    },
  },
});

export default NewTimeOffRequestTrigger;
