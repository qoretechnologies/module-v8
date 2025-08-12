import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FIGMA_APP_NAME, FigmaError } from '../constants';
import { figmaApiClient } from '../helpers/constants';
import { getFigmaProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getFigmaProjectFilesAllowedValues } from '../helpers/get-project-files-allowed-values';

const action = 'list_file_version_history';

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
  next_page_url: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listFileVersionHistory = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const nextPage = obj?.next_page_url;
    const path = nextPage ? new URL(nextPage).pathname : `files/${key}/versions`;

    try {
      const response = await figmaApiClient({
        path,
        method: 'GET',
        token,
      });

      return response;
    } catch (error) {
      throw new FigmaError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      versions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              created_at: { type: 'string' },
              label: { type: 'string' },
              description: { type: 'string' },
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
              thumbnail_url: { type: 'string' },
            },
          },
        },
      },
      pagination: {
        type: {
          type: 'hash',
          fields: {
            prev_page: { type: 'string' },
          },
        },
      },
    },
  },
});

export default listFileVersionHistory;
