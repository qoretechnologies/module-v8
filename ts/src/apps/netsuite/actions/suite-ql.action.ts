import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { NETSUITE_APP_NAME } from '../constants';
import { NetsuiteSuiteQLQueryAllowedValues } from '../helpers/suiteql-query-allowed-values';

export const NetsuiteSuiteQlOptions = {
  query: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    allowed_values: NetsuiteSuiteQLQueryAllowedValues,
  },
  limit: {
    type: 'int',
    required: false,
  },
  offset: {
    type: 'int',
    required: false,
  },
} satisfies TQoreOptions;

export const NetsuiteSuiteQlResponseType = {
  type: 'hash',
  fields: {
    links: {
      display_name: 'Links',
      short_desc: 'Links',
      desc: 'Links',
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            rel: {
              type: 'string',
            },
            href: {
              type: 'string',
            },
          },
        },
      },
    },
    count: {
      display_name: 'Count',
      short_desc: 'The number of results',
      desc: 'The number of results',
      type: 'number',
    },
    hasMore: {
      display_name: 'Has More',
      short_desc: 'Whether there are more results',
      desc: 'Whether there are more results',
      type: 'boolean',
    },
    items: {
      display_name: 'Items',
      short_desc: 'The items',
      desc: 'The items',
      type: {
        type: 'list',
        element_type: 'hash',
      },
    },
  },
} satisfies TQoreResponseType;

export const NetsuiteSuiteQlAction = QoreAppCreator.createLocalizedAction<
  typeof NetsuiteSuiteQlOptions
>({
  app: NETSUITE_APP_NAME,
  options: NetsuiteSuiteQlOptions,
  action: 'suite_ql',
  action_code: EQoreAppActionCode.ACTION,
  response_type: NetsuiteSuiteQlResponseType,
  api_function: async (obj, _options, context) => {
    const query = obj?.query;
    const account_id = context?.conn_opts?.account_id;
    const token = context?.conn_opts?.token;

    const result = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'transient',
        },
        path: `/services/rest/query/v1/suiteql`,
        params: {
          ...(obj?.limit && { limit: obj.limit.toString() }),
          ...(obj?.offset && { offset: obj.offset.toString() }),
        },
        data: {
          q: query,
        },
      },
      {
        endpointId: 'NetSuite',
        url: `https://${account_id}.suitetalk.api.netsuite.com`,
      }
    );

    return result.data;
  },
});
