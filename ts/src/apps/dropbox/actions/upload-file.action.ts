import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreFile,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { DropboxFileMetadataResponseType } from '../response-types';

const action = 'upload_file';

const options = {
  path: {
    type: 'string',
    required: false,
  },
  file: {
    type: 'file',
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
  strictConflict: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const UploadFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: DropboxFileMetadataResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, file } = getQoreContextRequiredValues<{
      token: string;
      file: TQoreFile;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['file'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    // Use provided path or default to root with filename from file
    const path = obj?.path || `/${file.name}`;
    const autorename = obj?.autorename ?? false;
    const mute = obj?.mute ?? false;
    const strictConflict = obj?.strictConflict ?? false;

    try {
      // Decode base64 content to get the actual file buffer
      const fileBuffer = Buffer.from(file.content, 'base64');

      const result = await dropboxClient.uploadContent<Record<string, any>>('files/upload', fileBuffer, {
        token,
        dropboxApiArg: {
          path,
          mode: 'add',
          autorename,
          mute,
          strict_conflict: strictConflict,
        },
      });

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to upload file: ${error.message || error}`);
    }
  },
});

export default UploadFile;
