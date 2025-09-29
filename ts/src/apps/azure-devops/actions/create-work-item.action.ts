import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { AZURE_DEVOPS_APP_NAME, AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient, mapAzureDevOpsWorkItem } from '../helpers/constants';
import { getAzureDevOpsProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getAzureDevOpsWorkItemFieldOptions } from '../helpers/get-work-item-fields';

const action = 'create_work_item';

const options = {
  project: {
    type: 'string',
    required: true,
    get_allowed_values: getAzureDevOpsProjectAllowedValues,
    on_change: ['refetch'],
  },
  itemType: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'Code Review Request', display_name: 'Code Review Request' },
      { value: 'Code Review Response', display_name: 'Code Review Response' },
      { value: 'Epic', display_name: 'Epic' },
      { value: 'Feedback Request', display_name: 'Feedback Request' },
      { value: 'Feedback Response', display_name: 'Feedback Response' },
      { value: 'Issue', display_name: 'Issue' },
      { value: 'Shared Parameter', display_name: 'Shared Parameter' },
      { value: 'Shared Steps', display_name: 'Shared Steps' },
      { value: 'Task', display_name: 'Task' },
      { value: 'Test Case', display_name: 'Test Case' },
      { value: 'Test Plan', display_name: 'Test Plan' },
      { value: 'Test Suite', display_name: 'Test Suite' },
    ],
  },
  properties: {
    required: true,
    depends_on: ['itemType'],
    type: {
      type: 'hash',
      fields: {
        'System.Title': { type: 'string', required: true },
        'System.Description': { type: 'string', required: false },
      },
    },
    get_dynamic_type: getAzureDevOpsWorkItemFieldOptions,
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
    const { token, organization, project, itemType, properties } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['organization', 'token'],
      optionFields: ['project', 'itemType', 'properties'],
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
      const workItem = await witApi.createWorkItem([], patchDocument, project, itemType);

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
