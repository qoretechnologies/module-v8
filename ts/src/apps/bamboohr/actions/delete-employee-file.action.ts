/**
 * Delete Employee File Action
 *
 * Deletes a file from an employee's files.
 *
 * @see https://documentation.bamboohr.com/reference/delete-employee-file-1
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';

const action = 'delete_employee_file';

const options = {
  employee_id: {
    type: 'string',
    required: true,
  },
  file_id: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: {
      type: 'bool',
      short_desc: 'Whether the deletion was successful',
    },
    message: {
      type: 'string',
      short_desc: 'Status message',
    },
  },
} satisfies TQoreResponseType;

const deleteEmployeeFile = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      await bambooHRClient.delete(
        `employees/${employee_id}/files/${file_id}`,
        {
          token: api_key,
          connectionOptions: { company_domain },
        }
      );

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: responseType,
});

export default deleteEmployeeFile;
