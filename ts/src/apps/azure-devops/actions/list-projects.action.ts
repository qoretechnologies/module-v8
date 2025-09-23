import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { AZURE_DEVOPS_APP_NAME, AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient } from '../helpers/constants';

const action = 'list_projects';

const options = {
  limit: {
    type: 'integer',
    required: false,
  },
  offset: {
    type: 'integer',
    required: false,
  },
  stateFilter: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'all', display_name: 'All' },
      { value: 'createPending', display_name: 'Create Pending' },
      { value: 'deleting', display_name: 'Deleting' },
      { value: 'deleted', display_name: 'Deleted' },
      { value: 'new', display_name: 'New' },
      { value: 'unchanged', display_name: 'Unchanged' },
      { value: 'wellFormed', display_name: 'WellFormed' },
    ],
  },
} satisfies TQoreOptions;

const ListProjects = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AZURE_DEVOPS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { ...options } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['organization', 'token'],
      ErrorClass: AzureDevOpsError,
    });

    const { limit, offset, stateFilter } = obj || {};

    try {
      const client = createAzureDevOpsClient(options);

      const coreApi = await client.getCoreApi();
      const projects = await coreApi.getProjects(stateFilter, limit, offset, undefined, true);

      return projects;
    } catch (error) {
      throw new AzureDevOpsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        url: { type: 'string' },
        state: { type: 'string' },
        revision: { type: 'integer' },
        visibility: { type: 'string' },
        lastUpdateTime: { type: 'string' },
        defaultTeamImageUrl: { type: 'string' },
      },
    },
  },
});

export default ListProjects;
