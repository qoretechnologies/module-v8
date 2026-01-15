/**
 * Search Time Off Requests Action
 *
 * Searches and filters time off requests in BambooHR.
 * Supports filtering by date range, employee, status, and type.
 *
 * @see https://documentation.bamboohr.com/reference/time-off-get-time-off-requests-2
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHRTimeOffRequest } from '../types';
import { getTimeOffTypesAllowedValues, getTimeOffStatusAllowedValues } from '../helpers/get-time-off-types';

const action = 'search_time_off_requests';

const options = {
  start_date: {
    type: 'date',
    required: true,
  },
  end_date: {
    type: 'date',
    required: true,
  },
  employee_id: {
    type: 'string',
    required: false,
  },
  status: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    element_allowed_values: getTimeOffStatusAllowedValues(),
  },
  type: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    get_element_allowed_values: getTimeOffTypesAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: {
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
      manager_notes: { type: 'softstring' },
    },
  },
} satisfies TQoreResponseType;

const searchTimeOffRequests = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, company_domain, start_date, end_date } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'company_domain'],
      optionFields: ['start_date', 'end_date'],
      ErrorClass: BambooHRError,
    });

    // Build query params
    const params: Record<string, string> = {};

    // Convert dates to YYYY-MM-DD format
    const startDateObj = new Date(start_date);
    params.start = startDateObj.toISOString().split('T')[0];

    const endDateObj = new Date(end_date);
    params.end = endDateObj.toISOString().split('T')[0];

    // Optional filters
    if (obj?.employee_id) {
      params.employeeId = obj.employee_id as string;
    }

    if (obj?.status && Array.isArray(obj.status) && obj.status.length > 0) {
      params.status = (obj.status as string[]).join(',');
    }

    if (obj?.type && Array.isArray(obj.type) && obj.type.length > 0) {
      params.type = (obj.type as string[]).join(',');
    }

    try {
      const response = await bambooHRClient.get<IBambooHRTimeOffRequest[]>('time_off/requests', {
        token,
        connectionOptions: { company_domain },
        params,
      });

      // Transform response to consistent format
      return (response || []).map((request) => ({
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
        manager_notes: request.notes?.manager || null,
      }));
    } catch (error) {
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: responseType,
});

export default searchTimeOffRequests;
