import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { AZURE_DEVOPS_APP_NAME, AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient, mapAzureDevOpsWorkItem } from '../helpers/constants';
import { getAzureDevOpsProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getAzureDevOpsWorkItemAllowedValues } from '../helpers/get-work-item-allowed-values';
import { AzureDevOpsDefaultWorkItemResponseType } from '../helpers/get-work-item-fields';

const action = 'get_work_item';

const options = {
  project: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getAzureDevOpsProjectAllowedValues,
    on_change: ['refetch'],
  },
  id: {
    type: 'number',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getAzureDevOpsWorkItemAllowedValues,
  },
} satisfies TQoreOptions;

const GetWorkItem = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AZURE_DEVOPS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { id, token, organization } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['organization', 'token'],
      optionFields: ['id'],
      ErrorClass: AzureDevOpsError,
    });

    try {
      const { project } = obj || {};
      const client = createAzureDevOpsClient({ token, organization });
      const coreApi = await client.getWorkItemTrackingApi();

      const workItem = await coreApi.getWorkItem(id, undefined, undefined, undefined, project);

      return mapAzureDevOpsWorkItem(workItem);
    } catch (error) {
      throw new AzureDevOpsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: AzureDevOpsDefaultWorkItemResponseType,
});

export default GetWorkItem;
