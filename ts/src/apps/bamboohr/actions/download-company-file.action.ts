/**
 * Download Company File Action
 *
 * Downloads a specific company file.
 *
 * @see https://documentation.bamboohr.com/reference/download-company-file-1
 */

import { EQoreAppActionCode, QoreAppCreator, TQoreOptions, TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { bambooHRClient } from '../client';
import { BAMBOOHR_APP_NAME, BambooHRError } from '../constants';

const action = 'download_company_file';

const options = {
  file_id: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    name: {
      type: 'softstring',
      short_desc: 'File name from Content-Disposition header',
    },
    mime_type: {
      type: 'string',
      short_desc: 'MIME type of the file',
    },
    content: {
      type: 'base64binary',
      short_desc: 'File content as base64 encoded binary',
    },
  },
} satisfies TQoreResponseType;

const downloadCompanyFile = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const result = await bambooHRClient.downloadFile(`files/${file_id}`, {
        token: api_key,
        connectionOptions: { company_domain },
      });

      return {
        name: result.name || null,
        mime_type: result.mime_type,
        content: result.content,
      };
    } catch (error) {
      throw new BambooHRError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: responseType,
});

export default downloadCompanyFile;
