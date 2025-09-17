import { Client } from '@microsoft/microsoft-graph-client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { SHAREPOINT_APP_NAME } from '../constants';
import { getSharepointDriveIdAllowedValues } from '../helpers/get-drive-id-allowed-values';
import { getSharepointSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';
import { SharepointIdentityQoreType } from './constants';

const options = {
  site_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSharepointSiteIdAllowedValues,
  },
  drive_id: {
    type: 'string',
    depends_on: ['site_id'],
    allowed_values_creatable: true,
    get_allowed_values: getSharepointDriveIdAllowedValues,
    required: true,
  },
  parent_folder: {
    type: 'string',
    required: true,
    default_value: '/',
  },
  folder_name: {
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
    name: {
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
    size: {
      type: 'number',
    },
    folder: {
      type: {
        type: 'hash',
        fields: {
          childCount: {
            type: 'number',
          },
        },
      },
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
    parentReference: {
      type: {
        type: 'hash',
        fields: {
          driveId: {
            type: 'string',
          },
          id: {
            type: 'string',
          },
          driveType: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          path: {
            type: 'string',
          },
          shareId: {
            type: 'string',
          },
        },
      },
    },
    fileSystemInfo: {
      type: {
        type: 'hash',
        fields: {
          createdDateTime: {
            type: 'string',
          },
          lastModifiedDateTime: {
            type: 'string',
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const CreateSharePointFolder = QoreAppCreator.createLocalizedAction({
  action: 'create-folder',
  app: SHAREPOINT_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const driveId = data?.drive_id;
    const parentFolder = data?.parent_folder;
    const folderName = data?.folder_name;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!driveId) missingValues.push('driveId');
    if (!parentFolder) missingValues.push('parentFolder');
    if (!folderName) missingValues.push('folderName');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to create SharePoint folder`
      );
    }
    const folderPath = `${parentFolder}${folderName}`;

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    return client.api(`/drives/${driveId}/root:/${folderPath}`).patch({
      folder: {},
    });
  },
  options,
  response_type,
});

export default CreateSharePointFolder;
