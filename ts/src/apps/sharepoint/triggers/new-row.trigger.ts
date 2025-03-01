import { Client } from '@microsoft/microsoft-graph-client';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SHAREPOINT_APP_NAME } from '../constants';
import { getSharepointListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getSharepointSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

interface ISharePointRow {
  id: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  webUrl: string;
  fields: Record<string, any>;
}

const sharePointNewRowTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SHAREPOINT_APP_NAME,
  action: 'new-row',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    site_id: {
      type: 'string',
      required: true,
      allowed_values_creatable: true,
      get_allowed_values: getSharepointSiteIdAllowedValues,
    },
    list_id: {
      type: 'string',
      depends_on: ['site_id'],
      required: true,
      allowed_values_creatable: true,
      get_allowed_values: getSharepointListIdAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const siteId = context?.opts?.site_id;
    const listId = context?.opts?.list_id;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!siteId) missingValues.push('siteId');
    if (!listId) missingValues.push('listId');

    if (missingValues.length) {
      throw new Error(
        `All of the following: ${missingValues.join(', ')} are required to activate Sharepoint new row trigger`
      );
    }

    const getRecords = () => {
      return getLastCreatedRecordItems({ token: token!, siteId: siteId!, listId: listId! });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'sharepoint_new_row',
      uniqueField: 'id',
      getItems: getRecords,
      update,
      should_stop,
    });
  },
  event_info: {
    desc: 'SharePoint row information',
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
        createdDateTime: {
          type: 'string',
        },
        lastModifiedDateTime: {
          type: 'string',
        },
        webUrl: {
          type: 'string',
        },
        fields: {
          type: 'hash',
        },
      },
    },
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const siteId = context?.opts?.site_id;
    const listId = context?.opts?.list_id;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!siteId) missingValues.push('siteId');
    if (!listId) missingValues.push('listId');

    if (missingValues.length) {
      throw new Error(
        `All of the following: 
        ${missingValues.join(', ')} 
        are required to get example event data for Sharepoint new row trigger`
      );
    }

    const data = await getLastCreatedRecordItems({
      token: token!,
      siteId: siteId!,
      listId: listId!,
      limit: 1,
    });

    return data?.length > 0 ? data[0] : null;
  },
});

const getLastCreatedRecordItems = async (options: {
  token: string;
  siteId: string;
  listId: string;
  limit?: number;
}): Promise<ISharePointRow[]> => {
  const { token, siteId, listId, limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT } = options;

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const result = await client
    .api(
      `/sites/${siteId}/lists/${listId}/items?$expand=fields&$orderby=createdDateTime desc&$top=${limit}`
    )
    .headers({ Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' })
    .get();

  return result.value;
};

export default sharePointNewRowTrigger;
