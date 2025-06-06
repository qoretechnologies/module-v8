import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { CONFLUENCE_APP_NAME, ConfluenceError } from '../constants';
import { ConfluenceMediaTypeAllowedValues } from '../helpers/get-media-type-allowed-values';

type ConfluenceAttachment = {
  id: string;
  status: string;
  title: string;
  mediaType: string;
  mediaTypeDescription: string;
  comment: string;
  fileId: string;
  fileSize: number;
  webuiLink: string;
  downloadLink: string;
  version: {
    number: number;
    authorId: string;
    message: string;
    createdAt: string;
  };
  _links: {
    download: string;
    webui: string;
  };
};

const ConfluenceNewAttachmentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: CONFLUENCE_APP_NAME,
  action: 'new_attachment',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    status: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      element_allowed_values: [
        {
          value: 'current',
          display_name: 'Current',
          desc: 'Attachments that are currently active',
        },
        {
          value: 'archived',
          display_name: 'Archived',
          desc: 'Attachments that have been archived',
        },
        {
          value: 'trashed',
          display_name: 'Trashed',
          desc: 'Attachments that have been moved to trash',
        },
      ],
    },
    mediaType: {
      type: 'string',
      required: false,
      allowed_values_creatable: true,
      allowed_values: ConfluenceMediaTypeAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, cloud_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'cloud_id'],
      ErrorClass: ConfluenceError,
    });

    const status = context.opts?.status as string[] | undefined;
    const mediaType = context.opts?.mediaType;

    const getItems = () => {
      return fetchLatestAttachments({
        token,
        cloud_id,
        status,
        mediaType,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'confluence_new_attachment',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, cloud_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'cloud_id'],
      ErrorClass: ConfluenceError,
    });

    const attachments = await fetchLatestAttachments({
      token,
      cloud_id,
    });

    return attachments?.length > 0 ? attachments[0] : null;
  },
  event_info: {
    desc: 'Confluence New Attachment Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
        status: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        mediaType: {
          type: 'string',
        },
        mediaTypeDescription: {
          type: 'string',
        },
        comment: {
          type: 'string',
        },
        fileId: {
          type: 'string',
        },
        fileSize: {
          type: 'number',
        },
        webuiLink: {
          type: 'string',
        },
        downloadLink: {
          type: 'string',
        },
        version: {
          type: {
            type: 'hash',
            fields: {
              number: {
                type: 'number',
              },
              authorId: {
                type: 'string',
              },
              message: {
                type: 'string',
              },
              createdAt: {
                type: 'string',
              },
            },
          },
        },
        _links: {
          type: {
            type: 'hash',
            fields: {
              download: {
                type: 'string',
              },
              webui: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
});

export default ConfluenceNewAttachmentTrigger;

const fetchLatestAttachments = async (options: {
  token: string;
  cloud_id: string;
  status?: string[];
  mediaType?: string;
}) => {
  const { token, cloud_id, status, mediaType } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const params: Record<string, string> = {
      limit: limit.toString(),
      sort: '-created-date',
    };

    if (status && status.length > 0) {
      params.status = status.join(',');
    }

    if (mediaType) {
      params['media-type'] = mediaType;
    }

    const response = await QorusRequest.get<{ data: { results: ConfluenceAttachment[] } }>(
      {
        path: `/attachments`,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      {
        url: `https://api.atlassian.com/ex/confluence/${cloud_id}/wiki/api/v2`,
        endpointId: CONFLUENCE_APP_NAME,
      }
    );

    const attachments = response?.data?.results || [];

    if (attachments.length === 0) {
      return [];
    }

    return attachments;
  } catch (error) {
    throw new ConfluenceError(`Failed to fetch latest attachments: ${error.message || error}`);
  }
};
