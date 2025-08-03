import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GEMINI_APP_NAME, GeminiError } from '../constants';
import { createGeminiClient } from '../helpers/constants';

const action = 'upload_file';

const options = {
  file: {
    type: 'file',
    required: true,
  },
  name: {
    type: 'string',
    preselected: true,
    required: false,
  },
} satisfies TQoreOptions;

const uploadFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GEMINI_APP_NAME,
  action,
  options,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['file'],
      ErrorClass: GeminiError,
    });

    const file = obj!.file!;
    const name = obj?.name;
    const client = createGeminiClient(token);

    try {
      const fileBuffer = Buffer.from(file.content, 'base64');
      const uint8Array = new Uint8Array(fileBuffer);
      const fileBlob = new Blob([uint8Array], { type: file.mime_type });

      const response = await client.files.upload({
        file: fileBlob,
        config: {
          mimeType: file.mime_type,
          ...(name ? { displayName: name } : { name: file.name }),
        },
      });

      return response;
    } catch (error) {
      throw new GeminiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      name: { type: 'string' },
      displayName: { type: 'string' },
      mimeType: { type: 'string' },
      sizeBytes: { type: 'string' },
      createTime: { type: 'string' },
      expirationTime: { type: 'string' },
      updateTime: { type: 'string' },
      sha256Hash: { type: 'string' },
      uri: { type: 'string' },
      state: { type: 'string' },
      source: { type: 'string' },
    },
  },
});

export default uploadFile;
