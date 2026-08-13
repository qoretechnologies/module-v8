import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import {
  AZURE_DEVOPS_APP_NAME,
  AZURE_DEVOPS_GRAPH_API_VERSION,
  AzureDevOpsError,
} from '../constants';
import { createAzureDevOpsClient } from '../helpers/constants';

const action = 'list_users';

const options = {
  limit: {
    type: 'integer',
    required: false,
  },
  continuationToken: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const ListUsers = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { limit = 20, continuationToken } = obj || {};
    const baseUrl = `https://vssps.dev.azure.com/${options.organization}/_apis/graph/users`;

    const params = new URLSearchParams({
      'api-version': AZURE_DEVOPS_GRAPH_API_VERSION,
      subjectTypes: 'aad,msa',
      top: limit,
      ...(continuationToken && { continuationToken }),
    });
    try {
      const client = createAzureDevOpsClient(options);

      const response = await client.vsoClient.restClient.get(`${baseUrl}?${params}`);

      const result = response.result as { value: Record<string, any>[] };

      const newContinuationToken = (response.headers as any)['x-ms-continuationtoken'];

      return {
        users: result.value.map(mapUsersToResponse),
        continuationToken: newContinuationToken,
      };
    } catch (error) {
      throw new AzureDevOpsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      users: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              subjectKind: { type: 'string' },
              metaType: { type: 'string' },
              directoryAlias: { type: 'string' },
              domain: { type: 'string' },
              principalName: { type: 'string' },
              mailAddress: { type: 'string' },
              origin: { type: 'string' },
              originId: { type: 'string' },
              displayName: { type: 'string' },
              url: { type: 'string' },
              descriptor: { type: 'string' },
            },
          },
        },
      },
      continuationToken: { type: 'string' },
    },
  },
});

const mapUsersToResponse = (user: Record<string, any>) => ({
  subjectKind: user?.subjectKind,
  metaType: user?.metaType,
  directoryAlias: user?.directoryAlias,
  domain: user?.domain,
  principalName: user?.principalName,
  mailAddress: user?.mailAddress,
  origin: user?.origin,
  originId: user?.originId,
  displayName: user?.displayName,
  url: user?.url,
  descriptor: user?.descriptor,
});

export default ListUsers;
