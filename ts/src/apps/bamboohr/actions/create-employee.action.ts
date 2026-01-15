/**
 * Create Employee Action
 *
 * Creates a new employee in BambooHR.
 * Requires at least firstName and lastName fields.
 *
 * @see https://documentation.bamboohr.com/reference/add-employee
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHREmployee } from '../types';
import {
  getBambooHREmployeeInputType,
  getBambooHREmployeeResponseType,
  transformInputToBambooHRFormat,
  transformBambooHRResponseToOutput,
} from '../helpers/dynamic-types';
import { getAllFieldsString } from '../helpers/get-fields';

const action = 'create_employee';

const options = {
  employee_data: {
    type: 'hash',
    required: true,
    get_dynamic_type: getBambooHREmployeeInputType,
  },
} satisfies TQoreOptions;

const createEmployee = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { api_key, company_domain, employee_data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['api_key', 'company_domain'],
      optionFields: ['employee_data'],
      ErrorClass: BambooHRError,
    });

    const connectionOptions = { api_key, company_domain };

    // Validate required fields
    if (!employee_data.firstName || !employee_data.lastName) {
      throw new BambooHRError('firstName and lastName are required to create an employee');
    }

    // Transform input to BambooHR API format
    const apiData = transformInputToBambooHRFormat(employee_data);

    try {
      // Create the employee
      const response = await bambooHRClient.post<{ data: Record<string, unknown>; headers: Record<string, string> }>(
        'employees',
        apiData,
        {
          token: api_key,
          connectionOptions: { company_domain },
          includeHeaders: true,
        }
      );

      // BambooHR returns the employee ID in the Location header
      // Format: https://{companyDomain}.bamboohr.com/api/v1/employees/{id}
      const location = response.headers?.location || response.headers?.Location;

      let employeeId: string | undefined;
      if (location) {
        const match = /employees\/(\d+)/.exec(location);
        if (match) {
          employeeId = match[1];
        }
      }

      if (!employeeId) {
        throw new BambooHRError('Failed to get created employee ID from response');
      }

      // Fetch the created employee to return full data
      const fieldsParam = await getAllFieldsString(connectionOptions);
      const createdEmployee = await bambooHRClient.get<IBambooHREmployee>(
        `employees/${employeeId}`,
        {
          token: api_key,
          connectionOptions: { company_domain },
          params: {
            fields: fieldsParam,
          },
        }
      );

      // Transform response to user-friendly format
      return await transformBambooHRResponseToOutput(connectionOptions, createdEmployee);
    } catch (error) {
      if (error instanceof BambooHRError) {
        throw error;
      }
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
    },
  },
  get_dynamic_response_type: getBambooHREmployeeResponseType,
});

export default createEmployee;
