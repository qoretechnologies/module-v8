/**
 * New Employee Trigger
 *
 * Triggers when a new employee is created in BambooHR.
 * Uses the custom reports API to detect newly created employees.
 *
 * @see https://documentation.bamboohr.com/reference/get-company-report
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHRCustomReportResponse, IBambooHREmployee } from '../types';

const options = {} satisfies TQoreOptions;

// Fields to fetch for new employees
const EMPLOYEE_FIELDS = [
  'id',
  'firstName',
  'lastName',
  'displayName',
  'workEmail',
  'department',
  'jobTitle',
  'hireDate',
  'status',
];

// Fetch employees using custom report
const fetchEmployees = async (api_key: string, company_domain: string): Promise<IBambooHREmployee[]> => {
  const response = await bambooHRClient.post<IBambooHRCustomReportResponse>(
    'reports/custom',
    {
      title: 'New Employee Trigger Report',
      fields: EMPLOYEE_FIELDS,
    },
    {
      token: api_key,
      connectionOptions: { company_domain },
      params: {
        format: 'JSON',
      },
    }
  );

  // Return only active employees, sorted by ID (newest first based on ID assumption)
  const employees = (response?.employees || []).filter((emp) => emp.status === 'Active');

  // Sort by ID descending (assuming higher IDs are newer)
  employees.sort((a, b) => Number(b.id) - Number(a.id));

  return employees.slice(0, DEFAULT_TRIGGER_POLL_ITEM_LIMIT);
};

// Transform employee to consistent event format
const transformEmployee = (employee: IBambooHREmployee) => ({
  id: String(employee.id),
  first_name: employee.firstName || null,
  last_name: employee.lastName || null,
  display_name: employee.displayName || null,
  email: employee.workEmail || null,
  department: employee.department || null,
  job_title: employee.jobTitle || null,
  hire_date: employee.hireDate || null,
  status: employee.status || null,
});

const NewEmployeeTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BAMBOOHR_APP_NAME,
  action: 'new_employee',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { api_key, company_domain } = getQoreContextRequiredValues({
      context,
      connectionFields: ['api_key', 'company_domain'],
      ErrorClass: BambooHRError,
    });

    const getItems = async () => {
      const employees = await fetchEmployees(api_key, company_domain);
      return employees.map(transformEmployee);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'bamboohr_new_employee',
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

    const employees = await fetchEmployees(api_key, company_domain);

    if (employees.length === 0) {
      // Return sample data if no employees found
      return {
        id: '123',
        first_name: 'John',
        last_name: 'Doe',
        display_name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        job_title: 'Software Developer',
        hire_date: '2026-01-15',
        status: 'Active',
      };
    }

    return transformEmployee(employees[0]);
  },
  event_info: {
    desc: 'BambooHR New Employee Event',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        first_name: { type: 'softstring' },
        last_name: { type: 'softstring' },
        display_name: { type: 'softstring' },
        email: { type: 'softstring' },
        department: { type: 'softstring' },
        job_title: { type: 'softstring' },
        hire_date: { type: 'softstring' },
        status: { type: 'softstring' },
      },
    },
  },
});

export default NewEmployeeTrigger;
