import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';

const action = 'get_image';

const options = {
  id: { type: 'string', required: true },
} satisfies TQoreOptions;

const getImage = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await canvaApiClient<{ asset: Record<string, any> }>({
        path: `assets/${id}`,
        method: 'GET',
        token,
      });

      return response.asset;
    } catch (error) {
      throw new CanvaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      type: { type: 'string' },
      id: { type: 'string' },
      name: { type: 'string' },
      tags: { type: { type: 'list', element_type: 'string' } },
      import_status: {
        type: {
          type: 'hash',
          fields: { state: { type: 'string' } },
        },
      },
      created_at: { type: 'integer' },
      updated_at: { type: 'integer' },
      owner: {
        type: {
          type: 'hash',
          fields: {
            user_id: { type: 'string' },
            team_id: { type: 'string' },
          },
        },
      },
      thumbnail: {
        type: {
          type: 'hash',
          fields: {
            width: { type: 'integer' },
            height: { type: 'integer' },
            url: { type: 'string' },
          },
        },
      },
    },
  },
});

export default getImage;
