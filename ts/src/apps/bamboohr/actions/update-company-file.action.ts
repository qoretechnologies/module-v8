/**
 * Update Company File Action
 *
 * Updates metadata for a company file (name, category, sharing).
 *
 * @see https://documentation.bamboohr.com/reference/update-company-file-1
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';
import { getCompanyFileCategoriesAllowedValues } from '../helpers/get-file-categories';

const action = 'update_company_file';

const options = {
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
    get_allowed_values: getCompanyFileCategoriesAllowedValues,
  },
  share_with_employees: {
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

const updateCompanyFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, company_domain, file_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'company_domain'],
      optionFields: ['file_id'],
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

    if (obj?.share_with_employees !== undefined) {
      updateData.shareWithEmployees = obj.share_with_employees ? 'yes' : 'no';
    }

    if (Object.keys(updateData).length === 0) {
      throw new BambooHRError('At least one field (name, category, or share_with_employees) must be provided');
    }

    try {
      await bambooHRClient.post(`files/${file_id}`, updateData, {
        token,
        connectionOptions: { company_domain },
      });

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

export default updateCompanyFile;
