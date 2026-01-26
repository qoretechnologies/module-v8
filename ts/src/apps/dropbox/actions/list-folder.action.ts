import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFolderAllowedValues } from '../helpers/get-folder-allowed-values';

const action = 'list_folder';

const options = {
  path: {
    type: 'string',
    required: true,
    get_allowed_values: getDropboxFolderAllowedValues,
  },
  recursive: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 2000,
  },
} satisfies TQoreOptions;

const entryType = {
  type: 'hash',
  fields: {
    '.tag': { type: 'string' },
    name: { type: 'string' },
    id: { type: 'string' },
    path_lower: { type: 'string' },
    path_display: { type: 'string' },
  },
} satisfies TQoreResponseType;

const responseType = {
  type: 'hash',
  fields: {
    entries: {
      type: {
        type: 'list',
        element_type: entryType,
      },
    },
    cursor: { type: 'string' },
    has_more: { type: 'bool' },
  },
} satisfies TQoreResponseType;

const ListFolder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, path } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['path'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const recursive = obj?.recursive ?? false;
    const limit = obj?.limit ?? 2000;

    try {
      const result = await dropboxClient.post<Record<string, any>>(
        'files/list_folder',
        {
          path,
          recursive,
          limit,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to list folder: ${error.message || error}`);
    }
  },
});

export default ListFolder;
