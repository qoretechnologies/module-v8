import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFileAllowedValues } from '../helpers/get-file-allowed-values';
import { DropboxFileMetadataResponseType } from '../response-types';

const action = 'delete_file';

const options = {
  path: {
    type: 'string',
    required: true,
    get_allowed_values: getDropboxFileAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    metadata: { type: DropboxFileMetadataResponseType },
  },
} as const;

const DeleteFile = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      const result = await dropboxClient.post<Record<string, any>>('files/delete_v2', { path }, { token });

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to delete file: ${error.message || error}`);
    }
  },
});

export default DeleteFile;
