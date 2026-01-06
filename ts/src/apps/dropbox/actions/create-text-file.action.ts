import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { DropboxFileMetadataResponseType } from '../response-types';

const action = 'create_text_file';

const options = {
  path: {
    type: 'string',
    required: true,
  },
  content: {
    type: 'string',
    required: true,
  },
  autorename: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  mute: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const CreateTextFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: DropboxFileMetadataResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, path, content } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['path', 'content'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const autorename = obj?.autorename ?? false;
    const mute = obj?.mute ?? false;

    try {
      const fileBuffer = Buffer.from(content, 'utf-8');

      const result = await dropboxClient.uploadContent<Record<string, any>>('files/upload', fileBuffer, {
        token,
        dropboxApiArg: {
          path,
          mode: 'add',
          autorename,
          mute,
        },
      });

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to create text file: ${error.message || error}`);
    }
  },
});

export default CreateTextFile;
