import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { SHAREPOINT_APP_NAME } from '../constants';
import { Client } from '@microsoft/microsoft-graph-client';
import { getSharepointSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';
import { getSharepointListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getSharepointItemIdAllowedValues } from '../helpers/get-item-id-allowed-values';
import { getSharepointListDependentOptions } from '../helpers/get-list-dependent-options';

const options = {
  site_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSharepointSiteIdAllowedValues,
  },
  list_id: {
    type: 'string',
    depends_on: ['site_id'],
    allowed_values_creatable: true,
    get_allowed_values: getSharepointListIdAllowedValues,
    required: true,
  },
  item_id: {
    type: 'string',
    depends_on: ['list_id', 'site_id'],
    allowed_values_creatable: true,
    get_allowed_values: getSharepointItemIdAllowedValues,
    get_dependent_options: getSharepointListDependentOptions,
    required: true,
  },
} satisfies TQoreOptions;

const additionalOptions = {
  list_columns: {
    depends_on: ['list_id', 'site_id'],
    type: 'hash',
    required: true,
  },
} satisfies TQoreOptions;
const response_type = {
  type: 'hash',
  fields: {},
} satisfies TQoreResponseType;

export const UpdateSharePointListItem = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  action: 'update-list-item',
  app: SHAREPOINT_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const siteId = data?.site_id;
    const listId = data?.list_id;
    const itemId = data?.item_id;
    const listColumns = data?.list_columns;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!siteId) missingValues.push('siteId');
    if (!listId) missingValues.push('listId');
    if (!itemId) missingValues.push('itemId');
    if (!listColumns) missingValues.push('listColumns');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to update SharePoint list item`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const fieldWithArrayValues: Record<string, string> = {};

    Object.entries(listColumns!).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        fieldWithArrayValues[`${key}@odata.type`] = 'Collection(Edm.String)';
      }
    });

    const itemInput = { ...listColumns, ...fieldWithArrayValues };

    return client.api(`/sites/${siteId}/lists/${listId}/items/${itemId}/fields`).patch(itemInput);
  },
  options,
  response_type,
});
