import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FIGMA_APP_NAME, FigmaError } from '../constants';
import { figmaApiClient } from '../helpers/constants';
import { getFigmaProjectAllowedValues } from '../helpers/get-project-allowed-values';

const action = 'list_project_files';

const options = {
  team: {
    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
  },
  project: {
    type: 'string',
    required: true,
    get_allowed_values: getFigmaProjectAllowedValues,
    allowed_values_creatable: true,
  },
} satisfies TQoreOptions;

const listProjectFiles = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIGMA_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['project'],
      ErrorClass: FigmaError,
    });

    try {
      const response = await figmaApiClient({
        path: `projects/${project}/files`,
        method: 'GET',
        object: 'files',
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
        key: { type: 'string' },
        name: { type: 'string' },
        thumbnail_url: { type: 'string' },
        last_modified: { type: 'string' },
      },
    },
  },
});

export default listProjectFiles;
