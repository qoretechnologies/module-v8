import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { SHAREPOINT_APP_NAME } from '../constants';
import { Client } from '@microsoft/microsoft-graph-client';
import { getSharepointListDependentOptions } from '../helpers/get-list-dependent-options';
import { getSharepointListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getSharepointSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';
import { SharepointIdentityQoreType } from './constants';

const options = {
  site_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSharepointSiteIdAllowedValues,
  },
  list_id: {
    type: 'string',
    allowed_values_creatable: true,
    on_change: ['refetch'],
    get_allowed_values: getSharepointListIdAllowedValues,
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
      type: 'hash',
    },
    createdBy: {
      type: {
        type: 'hash',
        fields: {
          user: SharepointIdentityQoreType,
          device: SharepointIdentityQoreType,
          application: SharepointIdentityQoreType,
        },
      },
    },
    lastModifiedBy: {
      type: {
        type: 'hash',
        fields: {
          user: SharepointIdentityQoreType,
          device: SharepointIdentityQoreType,
          application: SharepointIdentityQoreType,
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const CreateSharePointListItem = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof additionalOptions>
>({
  action: 'create-list-item',
  app: SHAREPOINT_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const siteId = data?.site_id;
    const listId = data?.list_id;
    const listColumns = data?.list_columns;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!siteId) missingValues.push('siteId');
    if (!listId) missingValues.push('listId');
    if (!listColumns) missingValues.push('listColumns');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to create SharePoint list item`
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

    const itemInput = {
      fields: { ...listColumns, ...fieldWithArrayValues },
    };

    return client.api(`/sites/${siteId}/lists/${listId}/items`).post(itemInput);
  },
  options,
  response_type,
});
