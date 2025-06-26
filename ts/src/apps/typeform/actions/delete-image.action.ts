import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { createClient } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TYPEFORM_APP_NAME, TypeformError } from '../constants';
import { getTypeformImageIdAllowedValues } from '../helpers/get-image-allowed-values';

const options = {
  image_id: {
    type: 'string',
    required: true,
    get_allowed_values: getTypeformImageIdAllowedValues,
  },
} satisfies TQoreOptions;

const deleteImage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TYPEFORM_APP_NAME,
  action: 'delete_image',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, image_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['image_id'],
      ErrorClass: TypeformError,
    });

    try {
      const client = createClient({ token });

      const response = await client.images.delete({
        id: image_id,
      });

      return response;
    } catch (error) {
      throw new TypeformError(`Failed to delete image: ${error.message || error}`);
    }
  },
});

export default deleteImage;
