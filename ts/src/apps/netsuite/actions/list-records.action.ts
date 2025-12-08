import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { NETSUITE_APP_NAME } from '../constants';
import { getNetsuiteQueryFieldAllowedValues } from '../helpers/get-query-field-allowed-value';
import { getNetsuiteRecordTypesAllowedValues } from '../helpers/get-record-type-allowed-values';

const options = {
  searchMode: {
    type: 'string',
    required: true,
    allowed_values: [
      {
        display_name: 'All',
        desc: 'If multiple query fields are provided, the record must match all of them',
        value: 'all',
      },
      {
        display_name: 'Any',
        desc: 'If multiple query fields are provided, the record must match at least one of them',
        value: 'any',
      },
    ],
    default_value: 'all',
  },
  recordType: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    on_change: ['refetch'],
    get_allowed_values: getNetsuiteRecordTypesAllowedValues,
  },
  fields: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getNetsuiteQueryFieldAllowedValues,
    element_allowed_values_creatable: true,
    required: false,
    depends_on: ['recordType'],
  },
  query: {
    preselected: true,
    required: false,
    depends_on: ['recordType'],
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          key: {
            type: 'string',
            get_allowed_values: getNetsuiteQueryFieldAllowedValues,
            allowed_values_creatable: true,
            required: true,
          },
          value: {
            type: 'softstring',
            required: true,
          },
        },
      },
    },
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

export const response_type = {
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
      type: 'bool',
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
    total_results: {
      type: 'number',
    },
  },
} satisfies TQoreResponseType;

export const NetsuiteListRecordsAction = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NETSUITE_APP_NAME,
  options,
  response_type,
  action: 'list_records',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _options, context) => {
    const query = obj?.query;
    const account_id = context?.conn_opts?.account_id;
    const token = context?.conn_opts?.token;
    const recordType = obj?.recordType;
    const fields = obj?.fields;
    const searchMode = obj?.searchMode || 'all';

    const missingValues: string[] = [];

    if (!account_id) missingValues.push('account_id');
    if (!token) missingValues.push('token');
    if (!recordType) missingValues.push('recordType');

    if (missingValues.length) {
      throw new Error(
        `The following values are required to get NetSuite records: ${missingValues.join(', ')}`
      );
    }

    let queryString: string | undefined = undefined;

    if (query?.length) {
      queryString = `WHERE ${query
        .map((item) => `${item.key} LIKE '%${item.value}%'`)
        .join(searchMode === 'all' ? ' AND ' : ' OR ')}`;
    }

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
          q: `SELECT ${fields ? fields.join(',') : '*'} FROM ${recordType} ${queryString || ''}`,
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
