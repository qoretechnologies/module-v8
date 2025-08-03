import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { GEMINI_APP_NAME, GeminiError } from '../constants';
import { createGeminiClient } from '../helpers/constants';

const action = 'list_files';

const listFiles = QoreAppCreator.createLocalizedAction({
  app: GEMINI_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GeminiError,
    });

    const client = createGeminiClient(token);

    try {
      const asyncIterable = await client.files.list();

      const files: Record<string, any>[] = [];
      for await (const f of asyncIterable) {
        files.push(f);
      }

      return files.map((file) => ({
        ...file,
        id: file.name!.replace('files/', ''),
      }));
    } catch (error) {
      throw new GeminiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
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
        id: { type: 'string' },
      },
    },
  },
});

export default listFiles;
