import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getHubspotListAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getHubspotListObjectPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import { HUBSPOT_APP_NAME } from '../constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';

const options = {
  listId: {
    type: 'string',
    get_allowed_values: getHubspotListAllowedValues,
    required: true,
  },
  after: {
    required: false,
    type: 'string',
  },
  before: {
    required: false,
    type: 'string',
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
  properties: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getHubspotListObjectPropertiesAllowedValues,
  },
} satisfies TQoreOptions;

export const getHubspotListRecordsAction = QoreAppCreator.createLocalizedAction({
  app: HUBSPOT_APP_NAME,
  action: 'get_list_records',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, listId } = await getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['listId'],
    });

    const after = obj?.after || '';
    const before = obj?.before || '';
    const limit = obj?.limit || 100;
    const properties = obj?.properties || [];

    try {
      const [listItemsResponse, listResponse] = await Promise.all([
        QorusRequest.get<{
          data: {
            results: {
              recordId: string;
            }[];
            total: number;
            paging: {
              next?: { after: string };
              prev?: { before: string };
            };
          };
        }>(
          {
            path: `/crm/v3/lists/${listId}/memberships/join-order`,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              ...(after && { after }),
              ...(before && { before }),
              ...(properties.length && { properties: properties.join(',') }),
              limit,
            },
          },
          {
            url: 'https://api.hubapi.com',
            endpointId: 'Hubspot',
          }
        ),
        QorusRequest.get<{
          data: { list: { objectTypeId: string } };
        }>(
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            path: `/crm/v3/lists/${listId}`,
          },
          {
            endpointId: 'Hubspot',
            url: 'https://api.hubapi.com',
          }
        ),
      ]);

      const listObjectId = listResponse?.data?.list?.objectTypeId;
      const listItems = listItemsResponse?.data?.results || [];
      const total = listItemsResponse?.data?.total || 0;
      const pagingAfter = listItemsResponse?.data?.paging?.next?.after || '';
      const pagingBefore = listItemsResponse?.data?.paging?.prev?.before || '';
      const recordIds = listItems.map((item) => item.recordId);

      if (!recordIds.length) {
        return {
          total,
          after: pagingAfter,
          before: pagingBefore,
          results: [],
        };
      }

      const recordsResponse = await QorusRequest.post<{
        data: {
          results: Record<string, any>[];
        };
      }>(
        {
          path: `/crm/v3/objects/${listObjectId}/batch/read`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            inputs: recordIds.map((id) => ({
              id,
            })),
          },
        },
        {
          url: 'https://api.hubapi.com',
          endpointId: 'Hubspot',
        }
      );

      return {
        total,
        after: pagingAfter,
        before: pagingBefore,
        results: recordsResponse?.data?.results || [],
      };
    } catch (error) {
      throw new Error(`Failed to fetch list records: ${error.message}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      total: {
        type: 'integer',
      },
      after: {
        type: 'string',
      },
      before: {
        type: 'string',
      },
      results: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
    },
  },
});

export default getHubspotListRecordsAction;
