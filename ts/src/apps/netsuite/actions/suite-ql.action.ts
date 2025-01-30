import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IActionOptions, TActionData } from '../../../global/models/actions';
import {
  EQoreAppActionCode,
  TQoreAppActionFunctionContext,
  TQorePartialAction,
  TQoreResponseType,
} from '../../../global/models/qore';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { NetsuiteSuiteQLQueryAllowedValues } from '../helpers/suiteql-query-allowed-values';

export const NetsuiteSuiteQlOptions = {
  query: {
    type: 'string',
    required: true,
    allowed_values: NetsuiteSuiteQLQueryAllowedValues,
    desc: 'SuiteQL query',
  },
  limit: {
    type: 'int',
    required: false,
    desc: 'Limit the number of results',
  },
  offset: {
    type: 'int',
    required: false,
    desc: 'Offset the results',
  },
} satisfies IActionOptions;

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

export const NetsuiteSuiteQlAction = {
  options: NetsuiteSuiteQlOptions,
  action: 'suite_ql',
  action_code: EQoreAppActionCode.ACTION,
  response_type: NetsuiteSuiteQlResponseType,
  api_function: async (
    obj: TActionData<typeof NetsuiteSuiteQlOptions>,
    _options,
    context: TQoreAppActionFunctionContext<typeof NETSUITE_CONN_OPTIONS>
  ) => {
    const { query } = obj;
    const {
      conn_opts: { account_id, token },
    } = context;

    const result = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'transient',
        },
        path: `/services/rest/query/v1/suiteql`,
        params: {
          ...(obj.limit && { limit: obj.limit.toString() }),
          ...(obj.offset && { offset: obj.offset.toString() }),
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
} satisfies TQorePartialAction<typeof NetsuiteSuiteQlOptions, typeof NetsuiteSuiteQlResponseType>;
