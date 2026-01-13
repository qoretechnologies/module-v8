/**
 * Update Employee Action
 *
 * Updates an existing employee in BambooHR.
 * Note: BambooHR uses POST (not PUT/PATCH) for updates.
 *
 * @see https://documentation.bamboohr.com/reference/update-employee
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

const action = 'update_employee';

const options = {
  employee_id: {
    type: 'string',
    required: true,
  },
  employee_data: {
    type: 'hash',
    required: true,
    get_dynamic_type: getBambooHREmployeeInputType,
  },
} satisfies TQoreOptions;

const updateEmployee = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { api_key, company_domain, employee_id, employee_data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['api_key', 'company_domain'],
      optionFields: ['employee_id', 'employee_data'],
      ErrorClass: BambooHRError,
    });

    const connectionOptions = { api_key, company_domain };

    // Transform input to BambooHR API format
    const apiData = transformInputToBambooHRFormat(employee_data);

    try {
      // Update the employee (BambooHR uses POST for updates)
      await bambooHRClient.post(
        `employees/${employee_id}`,
        apiData,
        {
          token: api_key,
          connectionOptions: { company_domain },
        }
      );

      // Fetch the updated employee to return full data
      const fieldsParam = await getAllFieldsString(connectionOptions);
      const updatedEmployee = await bambooHRClient.get<IBambooHREmployee>(
        `employees/${employee_id}`,
        {
          token: api_key,
          connectionOptions: { company_domain },
          params: {
            fields: fieldsParam,
          },
        }
      );

      // Transform response to user-friendly format
      return await transformBambooHRResponseToOutput(connectionOptions, updatedEmployee);
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

export default updateEmployee;
