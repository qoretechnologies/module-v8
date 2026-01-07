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

const action = 'restore_file_revision';

const options = {
  path: {
    type: 'string',
    required: true,
    get_allowed_values: getDropboxFileAllowedValues,
  },
  rev: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const RestoreFileRevision = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: DropboxFileMetadataResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, path, rev } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['path', 'rev'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    try {
      const result = await dropboxClient.post<Record<string, any>>(
        'files/restore',
        {
          path,
          rev,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to restore file revision: ${error.message || error}`);
    }
  },
});

export default RestoreFileRevision;
