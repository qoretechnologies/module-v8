/**
 * Upload Employee File Action
 *
 * Uploads a file to an employee's files in BambooHR.
 *
 * @see https://documentation.bamboohr.com/reference/upload-employee-file
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { TQoreFile } from '../types';
import { getEmployeeFileCategoriesAllowedValues } from '../helpers/get-file-categories';

const action = 'upload_employee_file';

const options = {
  employee_id: {
    type: 'string',
    required: true,
  },
  category: {
    type: 'string',
    required: true,
    get_allowed_values: getEmployeeFileCategoriesAllowedValues,
  },
  file: {
    type: 'file',
    required: true,
  },
  share_with_employee: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    id: {
      type: 'softstring',
      short_desc: 'ID of the uploaded file',
    },
    message: {
      type: 'string',
      short_desc: 'Success message',
    },
  },
} satisfies TQoreResponseType;

const uploadEmployeeFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { api_key, company_domain, employee_id, category, file } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['api_key', 'company_domain'],
      optionFields: ['employee_id', 'category', 'file'],
      ErrorClass: BambooHRError,
    });

    const fileData = file as TQoreFile;

    if (!fileData.name || !fileData.content) {
      throw new BambooHRError('File must have name and content');
    }

    // Build form fields
    const formFields: Record<string, string> = {
      category: String(category),
      fileName: fileData.name,
      share: obj?.share_with_employee ? 'yes' : 'no',
    };

    try {
      const result = await bambooHRClient.uploadFile<{ id?: string; message: string }>(
        `employees/${employee_id}/files`,
        fileData,
        formFields,
        {
          token: api_key,
          connectionOptions: { company_domain },
        }
      );

      return {
        id: result.id || null,
        message: result.message || 'File uploaded successfully',
      };
    } catch (error) {
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: responseType,
});

export default uploadEmployeeFile;
