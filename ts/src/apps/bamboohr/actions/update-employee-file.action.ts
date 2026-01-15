/**
 * Update Employee File Action
 *
 * Updates metadata for an employee file (name, category, sharing).
 *
 * @see https://documentation.bamboohr.com/reference/update-employee-file-1
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { getEmployeeFileCategoriesAllowedValues } from '../helpers/get-file-categories';

const action = 'update_employee_file';

const options = {
  employee_id: {
    type: 'string',
    required: true,
  },
  file_id: {
    type: 'string',
    required: true,
  },
  name: {
    type: 'string',
    required: false,
  },
  category: {
    type: 'string',
    required: false,
    get_allowed_values: getEmployeeFileCategoriesAllowedValues,
  },
  share_with_employee: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: {
      type: 'bool',
      short_desc: 'Whether the update was successful',
    },
    message: {
      type: 'string',
      short_desc: 'Status message',
    },
  },
} satisfies TQoreResponseType;

const updateEmployeeFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { api_key, company_domain, employee_id, file_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['api_key', 'company_domain'],
      optionFields: ['employee_id', 'file_id'],
      ErrorClass: BambooHRError,
    });

    // Build update payload - only include fields that were provided
    const updateData: Record<string, string> = {};

    if (obj?.name !== undefined) {
      updateData.name = obj.name as string;
    }

    if (obj?.category !== undefined) {
      updateData.categoryId = String(obj.category);
    }

    if (obj?.share_with_employee !== undefined) {
      updateData.shareWithEmployee = obj.share_with_employee ? 'yes' : 'no';
    }

    if (Object.keys(updateData).length === 0) {
      throw new BambooHRError('At least one field (name, category, or share_with_employee) must be provided');
    }

    try {
      await bambooHRClient.post(
        `employees/${employee_id}/files/${file_id}`,
        updateData,
        {
          token: api_key,
          connectionOptions: { company_domain },
        }
      );

      return {
        success: true,
        message: 'File updated successfully',
      };
    } catch (error) {
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: responseType,
});

export default updateEmployeeFile;
