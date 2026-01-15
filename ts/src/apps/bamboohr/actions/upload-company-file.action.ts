/**
 * Upload Company File Action
 *
 * Uploads a file to company files in BambooHR.
 *
 * @see https://documentation.bamboohr.com/reference/upload-company-file-1
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { TQoreFile } from '../types';
import { getCompanyFileCategoriesAllowedValues } from '../helpers/get-file-categories';

const action = 'upload_company_file';

const options = {
  category: {
    type: 'string',
    required: true,
    get_allowed_values: getCompanyFileCategoriesAllowedValues,
  },
  file: {
    type: 'file',
    required: true,
  },
  share_with_employees: {
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

const uploadCompanyFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, company_domain, category, file } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'company_domain'],
      optionFields: ['category', 'file'],
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
      share: obj?.share_with_employees ? 'yes' : 'no',
    };

    try {
      const result = await bambooHRClient.uploadFile<{ id?: string; message: string }>(
        'files',
        fileData,
        formFields,
        {
          token,
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

export default uploadCompanyFile;
