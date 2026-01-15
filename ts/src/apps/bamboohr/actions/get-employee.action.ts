/**
 * Get Employee Action
 *
 * Retrieves a single employee's data from BambooHR.
 * Supports dynamic field selection and returns all requested fields.
 *
 * @see https://documentation.bamboohr.com/reference/get-employee
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHREmployee } from '../types';
import {
  getBambooHREmployeeResponseType,
  getBambooHRStandardFieldsAllowedValues,
  transformBambooHRResponseToOutput,
} from '../helpers/dynamic-types';
import { getAllFieldsString } from '../helpers/get-fields';

const action = 'get_employee';

const options = {
  employee_id: {
    type: 'string',
    required: true,
  },
  fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    get_element_allowed_values: getBambooHRStandardFieldsAllowedValues,
  },
} satisfies TQoreOptions;

const getEmployee = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { api_key, company_domain, employee_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['api_key', 'company_domain'],
      optionFields: ['employee_id'],
      ErrorClass: BambooHRError,
    });

    const connectionOptions = { api_key, company_domain };

    // Build fields parameter - use provided fields or fetch all
    let fieldsParam: string;
    if (obj?.fields && Array.isArray(obj.fields) && obj.fields.length > 0) {
      fieldsParam = obj.fields.join(',');
    } else {
      // Get all available fields (up to BambooHR's 400 field limit)
      fieldsParam = await getAllFieldsString(connectionOptions);
    }

    try {
      const response = await bambooHRClient.get<IBambooHREmployee>(
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
      return await transformBambooHRResponseToOutput(connectionOptions, response);
    } catch (error) {
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

export default getEmployee;
