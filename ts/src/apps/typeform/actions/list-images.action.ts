import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { createClient } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TYPEFORM_APP_NAME, TypeformError } from '../constants';

const response_type = {
  type: 'list',
  element_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      src: { type: 'string' },
      file_name: { type: 'string' },
      width: { type: 'integer' },
      height: { type: 'integer' },
      media_type: { type: 'string' },
      has_alpha: { type: 'boolean' },
      avg_color: { type: 'string' },
    },
  },
} satisfies TQoreResponseType;

const listImages = QoreAppCreator.createLocalizedAction({
  app: TYPEFORM_APP_NAME,
  action: 'list_images',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: TypeformError,
    });

    try {
      const client = createClient({ token });

      return await client.images.list();
    } catch (error) {
      throw new TypeformError(`Failed to list images: ${error.message || error}`);
    }
  },
  response_type,
});

export default listImages;
