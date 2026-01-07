import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { DropboxFolderMetadataWrappedResponseType } from '../response-types';

const action = 'create_folder';

const options = {
  path: {
    type: 'string',
    required: true,
  },
  autorename: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const CreateFolder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: DropboxFolderMetadataWrappedResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, path } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['path'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const autorename = obj?.autorename ?? false;

    try {
      const result = await dropboxClient.post<Record<string, any>>(
        'files/create_folder_v2',
        {
          path,
          autorename,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to create folder: ${error.message || error}`);
    }
  },
});

export default CreateFolder;
