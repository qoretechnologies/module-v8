import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CANVA_APP_NAME, CanvaError } from '../constants';
import { canvaApiClient } from '../helpers/constants';

const action = 'update_image';

const options = {
  id: { type: 'string', required: true },
  name: { type: 'string', required: false },
  tags: {
    type: { type: 'list', element_type: 'string' },
    required: false,
  },
} satisfies TQoreOptions;

const updateImage = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const payload: Record<string, any> = {};
    if (obj?.name) payload.name = obj.name;
    if (obj?.tags?.length) payload.tags = obj.tags.map((t: string) => t.trim()).filter(Boolean);

    try {
      const res = await canvaApiClient<{ asset: Record<string, any> }>({
        path: `assets/${id}`,
        method: 'PATCH',
        token,
        body: payload,
      });

      return res.asset;
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

export default updateImage;
