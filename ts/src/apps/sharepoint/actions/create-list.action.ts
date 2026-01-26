import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { SHAREPOINT_APP_NAME } from '../constants';
import { Client } from '@microsoft/microsoft-graph-client';
import { List } from '@microsoft/microsoft-graph-types';
import { getSharepointSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const options = {
  site_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSharepointSiteIdAllowedValues,
  },
  list_name: {
    type: 'string',
    required: true,
  },
  list_description: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;
const response_type = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
    displayName: {
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
    cTag: {
      type: 'string',
    },
    eTag: {
      type: 'string',
    },
    list: {
      type: {
        type: 'hash',
        fields: {
          template: {
            type: 'string',
          },
          hidden: {
            type: 'bool',
          },
          contentTypesEnabled: {
            type: 'bool',
          },
        },
      },
    },
    sharepointIds: {
      type: {
        type: 'hash',
        fields: {
          siteId: {
            type: 'string',
          },
          webId: {
            type: 'string',
          },
          listId: {
            type: 'string',
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const CreateSharePointList = QoreAppCreator.createLocalizedAction({
  action: 'create-list',
  app: SHAREPOINT_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const listName = data?.list_name;
    const listDescription = data?.list_description;
    const siteId = data?.site_id;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!siteId) missingValues.push('siteId');
    if (!listName) missingValues.push('listName');
    if (!listDescription) missingValues.push('listDescription');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to create SharePoint list`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const listInput: List = {
      displayName: listName,
      description: listDescription,
    };

    return client.api(`/sites/${siteId}/Lists`).post(listInput);
  },
  options,
  response_type,
});

export default CreateSharePointList;
