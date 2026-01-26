import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { SHAREPOINT_APP_NAME } from '../constants';
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
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSharepointListIdAllowedValues,
  },
  search_value: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;
const response_type = {
  type: 'hash',
  fields: {
    value: {
      type: {
        type: 'list',
        element_type: {
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
            eTag: {
              type: 'string',
            },
            fields: {
              type: {
                type: 'hash',
                fields: {
                  Title: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const SearchSharePointListItem = QoreAppCreator.createLocalizedAction({
  action: 'search-list-item',
  app: SHAREPOINT_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const siteId = data?.site_id;
    const listId = data?.list_id;
    const searchValue = data?.search_value;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!siteId) missingValues.push('siteId');
    if (!listId) missingValues.push('listId');
    if (!searchValue) missingValues.push('searchValue');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to search SharePoint list item`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const title = searchValue!.replace("'", "''");

    return client
      .api(
        `/sites/${siteId}/lists/${listId}/items?$expand=fields&filter=fields/Title eq '${title}'`
      )
      .headers({ Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' })
      .get();
  },
  options,
  response_type,
});

export default SearchSharePointListItem;
