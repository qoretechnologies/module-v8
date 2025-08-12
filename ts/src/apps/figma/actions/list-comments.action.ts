import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FIGMA_APP_NAME, FigmaError } from '../constants';
import { figmaApiClient } from '../helpers/constants';
import { getFigmaProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getFigmaProjectFilesAllowedValues } from '../helpers/get-project-files-allowed-values';

const action = 'list_comments';

const options = {
  team: {
    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
  },
  project: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getFigmaProjectAllowedValues,
    allowed_values_creatable: true,
    on_change: ['refetch'],
  },
  key: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getFigmaProjectFilesAllowedValues,
  },
} satisfies TQoreOptions;

const listComments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIGMA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['key'],
      ErrorClass: FigmaError,
    });

    try {
      const response = await figmaApiClient({
        path: `files/${key}/comments`,
        method: 'GET',
        object: 'comments',
        token,
      });

      return response;
    } catch (error) {
      throw new FigmaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        uuid: { type: 'string' },
        file_key: { type: 'string' },
        parent_id: { type: 'string' },
        user: {
          type: {
            type: 'hash',
            fields: {
              handle: { type: 'string' },
              img_url: { type: 'string' },
              id: { type: 'string' },
            },
          },
        },
        created_at: { type: 'string' },
        resolved_at: { type: 'string' },
        message: { type: 'string' },
        reactions: {
          type: {
            type: 'list',
            element_type: 'hash',
          },
        },
        client_meta: {
          type: {
            type: 'hash',
            fields: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
          },
        },
        order_id: { type: 'string' },
      },
    },
  },
});

export default listComments;
