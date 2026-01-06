import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { DROPBOX_APP_NAME, DROPBOX_CONTENT_URL, DropboxError } from '../constants';
import { getDropboxFileAllowedValues } from '../helpers/get-file-allowed-values';

const action = 'download_file';

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
    name: {
      type: 'string',
      short_desc: 'Name of the file',
    },
    id: {
      type: 'string',
      short_desc: 'Unique identifier for the file',
    },
    size: {
      type: 'integer',
      short_desc: 'File size in bytes',
    },
    content: {
      type: 'base64binary',
      short_desc: 'File content as base64 encoded binary',
    },
  },
} satisfies TQoreResponseType;

const DownloadFile = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const dropboxApiArg = JSON.stringify({ path });

      const response = await fetch(`${DROPBOX_CONTENT_URL}/2/files/download`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Dropbox-API-Arg': dropboxApiArg,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Get metadata from response header
      const metadataHeader = response.headers.get('dropbox-api-result');
      const metadata = metadataHeader ? JSON.parse(metadataHeader) : {};

      // Get file content as buffer and convert to base64
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const content = buffer.toString('base64');

      return {
        name: metadata.name,
        id: metadata.id,
        size: metadata.size,
        content,
      };
    } catch (error) {
      throw new DropboxError(`Failed to download file: ${error.message || error}`);
    }
  },
});

export default DownloadFile;
