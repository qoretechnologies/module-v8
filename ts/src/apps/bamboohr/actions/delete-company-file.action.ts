/**
 * Delete Company File Action
 *
 * Deletes a company file.
 *
 * @see https://documentation.bamboohr.com/reference/delete-company-file-1
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';

const action = 'delete_company_file';

const options = {
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

const deleteCompanyFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BAMBOOHR_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { api_key, company_domain, file_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['api_key', 'company_domain'],
      optionFields: ['file_id'],
      ErrorClass: BambooHRError,
    });

    try {
      await bambooHRClient.delete(`files/${file_id}`, {
        token: api_key,
        connectionOptions: { company_domain },
      });

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

export default deleteCompanyFile;
