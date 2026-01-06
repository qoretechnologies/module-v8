import {
  EQoreAppActionCode,
  QoreAppCreator,
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
    required: true,
  },
  fileContent: {
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
    const { token, path, fileContent } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['path', 'fileContent'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const autorename = obj?.autorename ?? false;
    const mute = obj?.mute ?? false;
    const strictConflict = obj?.strictConflict ?? false;

    try {
      // Handle base64 content (with or without data URL prefix)
      let base64Content = fileContent;
      if (fileContent.includes('base64,')) {
        base64Content = fileContent.split('base64,')[1];
      }

      const fileBuffer = Buffer.from(base64Content, 'base64');

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
