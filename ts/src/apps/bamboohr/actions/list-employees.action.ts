/**
 * List Employees Action
 *
 * Retrieves a list of employees from BambooHR.
 * Uses the custom report endpoint for efficient bulk retrieval with field selection.
 *
 * @see https://documentation.bamboohr.com/reference/get-company-report
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { IBambooHRCustomReportResponse, IBambooHREmployee } from '../types';
import {
  getBambooHREmployeeResponseType,
  getBambooHRFieldsAllowedValues,
  transformBambooHREmployeeList,
} from '../helpers/dynamic-types';
import { getBambooHRFields } from '../helpers/get-fields';

const action = 'list_employees';

const options = {
  fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    get_element_allowed_values: getBambooHRFieldsAllowedValues,
  },
} satisfies TQoreOptions;

const listEmployees = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, company_domain } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'company_domain'],
      ErrorClass: BambooHRError,
    });

    const connectionOptions = { token, company_domain };

    // Build fields list - use provided fields or get default set
    let fieldsList: string[];
    if (obj?.fields && Array.isArray(obj.fields) && obj.fields.length > 0) {
      fieldsList = obj.fields;
    } else {
      // Get a sensible default set of fields (not all 400+ fields)
      const allFields = await getBambooHRFields(connectionOptions);
      // Use fields with aliases (standard fields) up to 50 fields
      fieldsList = allFields
        .filter((field) => field.alias)
        .slice(0, 50)
        .map((field) => field.alias as string);

      // Always include essential fields if not already present
      const essentialFields = ['id', 'firstName', 'lastName', 'displayName', 'workEmail', 'department', 'jobTitle'];
      essentialFields.forEach((field) => {
        if (!fieldsList.includes(field)) {
          fieldsList.unshift(field);
        }
      });
    }

    try {
      // Use custom report endpoint for efficient bulk retrieval
      const response = await bambooHRClient.post<IBambooHRCustomReportResponse>(
        'reports/custom',
        {
          title: 'Employee List',
          fields: fieldsList,
        },
        {
          token,
          connectionOptions: { company_domain },
          params: {
            format: 'JSON',
          },
        }
      );

      const employees = response?.employees || [];

      // Transform response to user-friendly format
      return await transformBambooHREmployeeList(connectionOptions, employees as IBambooHREmployee[]);
    } catch (error) {
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
      },
    },
  },
  get_dynamic_response_type: async (context) => {
    const employeeType = await getBambooHREmployeeResponseType(context);
    return {
      type: 'list',
      element_type: employeeType,
    };
  },
});

export default listEmployees;
