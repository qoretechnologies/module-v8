import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';

const action = 'delete_image';

const options = {
  id: { type: 'string', required: true },
} satisfies TQoreOptions;

const deleteImage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CANVA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['id'],
      connectionFields: ['token'],
      ErrorClass: CanvaError,
    });

    try {
      await canvaApiClient({
        path: `assets/${id}`,
        method: 'DELETE',
        token,
      });

      return { id, deleted: true };
    } catch (error) {
      throw new CanvaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      deleted: { type: 'boolean' },
    },
  },
});

export default deleteImage;
