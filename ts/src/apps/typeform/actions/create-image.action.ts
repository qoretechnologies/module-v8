import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { createClient } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractTypeformErrorMessage, TYPEFORM_APP_NAME, TypeformError } from '../constants';

const options = {
  url: {
    type: 'string',
    required_groups: ['create_image'],
  },
  file_name: {
    type: 'string',
    required: false,
  },
  image: {
    type: 'file',
    required_groups: ['create_image'],
  },
} satisfies TQoreOptions;

const createImage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TYPEFORM_APP_NAME,
  action: 'create_image',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: TypeformError,
    });

    const { url, file_name, image } = obj || {};

    try {
      const client = createClient({ token });

      if (image) {
        return await client.images.add({
          fileName: file_name || image.name,
          image: image.content,
        });
      }

      return await client.images.add({
        fileName: file_name || 'newimage',
        url,
      });
    } catch (error) {
      throw new TypeformError(`Failed to create image: ${extractTypeformErrorMessage(error)}`);
    }
  },
  response_type: {
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
});

export default createImage;
