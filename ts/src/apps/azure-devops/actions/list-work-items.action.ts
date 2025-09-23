import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { AZURE_DEVOPS_APP_NAME, AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient, mapAzureDevOpsWorkItem } from '../helpers/constants';
import { getAzureDevOpsProjectAllowedValues } from '../helpers/get-project-allowed-values';
import {
  AzureDevOpsDefaultWorkItemResponseType,
  getAzureDevOpsWorkItemResponseType,
} from '../helpers/get-work-item-fields';

const action = 'list_work_items';

const options = {
  project: {
    type: 'string',
    required: true,
    get_allowed_values: getAzureDevOpsProjectAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
  },
  itemType: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: [
      { value: 'Task', display_name: 'Task' },
      { value: 'Epic', display_name: 'Epic' },
      { value: 'Feature', display_name: 'Feature' },
      { value: 'User Story', display_name: 'User Story' },
      { value: 'Issue', display_name: 'Issue' },
      { value: 'Bug', display_name: 'Bug' },
    ],
  },
  state: {
    type: 'string',
    required: false,
    allowed_values_creatable: true,
    allowed_values: [
      { value: 'new', display_name: 'New' },
      { value: 'active', display_name: 'Active' },
      { value: 'resolved', display_name: 'Resolved' },
      { value: 'closed', display_name: 'Closed' },
      { value: 'removed', display_name: 'Removed' },
    ],
  },
  title: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const ListWorkItems = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AZURE_DEVOPS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { project, token, organization } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['organization', 'token'],
      optionFields: ['project'],
      ErrorClass: AzureDevOpsError,
    });

    const { limit = 20, itemType, state, title } = obj || {};

    try {
      const client = createAzureDevOpsClient({ token, organization });
      const coreApi = await client.getWorkItemTrackingApi();

      let filter = '';
      if (itemType) {
        filter += `[System.WorkItemType] = '${itemType}'`;
      }

      if (state) {
        if (filter) filter += ' AND ';
        filter += `[System.State] = '${state}'`;
      }

      if (title) {
        if (filter) filter += ' AND ';
        filter += `[System.Title] CONTAINS '${title}'`;
      }

      const wiql = {
        query:
          `SELECT [System.Id], [System.Title] FROM WorkItems` +
          (filter ? ` WHERE ${filter}` : '') +
          ` ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.CreatedDate] DESC`,
      };

      const response = await coreApi.queryByWiql(wiql, { projectId: project }, undefined, limit);

      if (!response?.workItems || response.workItems.length === 0) {
        return [];
      }

      const workItemIds: number[] = [];
      response.workItems.forEach((item: { id: number }) => {
        if (item.id) workItemIds.push(item.id);
      });

      const workItems = await coreApi.getWorkItems(workItemIds);

      return workItems.map(mapAzureDevOpsWorkItem);
    } catch (error) {
      throw new AzureDevOpsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  get_dynamic_response_type: async (context) => {
    const type = await getAzureDevOpsWorkItemResponseType(context);

    return {
      type: 'list',
      element_type: type,
    };
  },
  response_type: {
    type: 'list',
    element_type: AzureDevOpsDefaultWorkItemResponseType as TQoreType,
  },
});

export default ListWorkItems;
