import { Client } from '@microsoft/microsoft-graph-client';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { SHAREPOINT_APP_NAME } from '../constants';
import { getSharepointItemIdAllowedValues } from '../helpers/get-item-id-allowed-values';
import { getSharepointListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getSharepointSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

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
    required: true,
  },
} satisfies TQoreOptions;

const DeleteSharePointListItem = QoreAppCreator.createLocalizedAction({
  action: 'delete-list-item',
  app: SHAREPOINT_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const siteId = data?.site_id;
    const listId = data?.list_id;
    const itemId = data?.item_id;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!siteId) missingValues.push('siteId');
    if (!listId) missingValues.push('listId');
    if (!itemId) missingValues.push('itemId');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to delete SharePoint list item`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    return client.api(`/sites/${siteId}/lists/${listId}/items/${itemId}`).delete();
  },
  options,
});

export default DeleteSharePointListItem;
