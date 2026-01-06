import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFileAllowedValues } from '../helpers/get-file-allowed-values';
import { DropboxListRevisionsResponseType } from '../response-types';

const action = 'list_file_revisions';

const options = {
  path: {
    type: 'string',
    required: true,
    get_allowed_values: getDropboxFileAllowedValues,
  },
  mode: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'path', display_name: 'By Path' },
      { value: 'id', display_name: 'By ID' },
    ],
    default_value: 'path',
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 10,
  },
} satisfies TQoreOptions;

const ListFileRevisions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: DropboxListRevisionsResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, path } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['path'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const mode = { '.tag': obj?.mode || 'path' };
    const limit = obj?.limit ?? 10;

    try {
      const result = await dropboxClient.post<Record<string, any>>(
        'files/list_revisions',
        {
          path,
          mode,
          limit,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to list file revisions: ${error.message || error}`);
    }
  },
});

export default ListFileRevisions;
