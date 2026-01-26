import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { AZURE_DEVOPS_APP_NAME, AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient, mapAzureDevOpsWorkItem } from '../helpers/constants';
import { getAzureDevOpsProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getAzureDevOpsWorkItemAllowedValues } from '../helpers/get-work-item-allowed-values';
import { getAzureDevOpsWorkItemFieldOptions } from '../helpers/get-work-item-fields';

const action = 'update_work_item';

const options = {
  project: {
    type: 'string',
    required: true,
    get_allowed_values: getAzureDevOpsProjectAllowedValues,
    on_change: ['refetch'],
  },
  itemId: {
    type: 'number',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getAzureDevOpsWorkItemAllowedValues,
    on_change: ['refetch'],
  },
  properties: {
    required: true,
    type: {
      type: 'hash',
      fields: {
        'System.Title': { type: 'string', required: true },
        'System.Description': { type: 'string', required: false },
      },
    },
    get_dynamic_type: async (context) => {
      const { itemId, token, project, organization } = getQoreContextRequiredValues({
        context,
        optionFields: ['itemId', 'project'],
        connectionFields: ['organization', 'token'],
        ErrorClass: AzureDevOpsError,
      });

      const client = createAzureDevOpsClient({ token, organization });
      const witApi = await client.getWorkItemTrackingApi();
      const workItem = await witApi.getWorkItem(itemId, undefined, undefined, undefined, project);

      return getAzureDevOpsWorkItemFieldOptions({
        ...context,
        opts: { ...context?.opts, itemType: workItem.fields?.['System.WorkItemType'] },
      });
    },
  },
} satisfies TQoreOptions;

interface WorkItemPatch {
  op: 'add';
  path: string;
  value: string | number | boolean;
}

const CreateWorkItem = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AZURE_DEVOPS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, organization, project, itemId, properties } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['organization', 'token'],
      optionFields: ['project', 'itemId', 'properties'],
      ErrorClass: AzureDevOpsError,
    });

    try {
      const patchDocument: WorkItemPatch[] = [];

      for (const [key, value] of Object.entries(properties || {})) {
        const path = `/fields/${key}`;
        patchDocument.push({ op: 'add', path, value: value as string | number | boolean });
      }

      const client = createAzureDevOpsClient({ token, organization });
      const witApi = await client.getWorkItemTrackingApi();
      const workItem = await witApi.updateWorkItem([], patchDocument, itemId, project);

      return mapAzureDevOpsWorkItem(workItem);
    } catch (error) {
      throw new AzureDevOpsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
  },
});

export default CreateWorkItem;
