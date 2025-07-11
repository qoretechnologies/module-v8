import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import {
  buildKlaviyoFilterString,
  getKlaviyoApis,
  getKlaviyoErrorMessage,
} from '../helpers/constants';

const options = {
  cursor: {
    required: false,
    type: 'string',
  },
  pageSize: {
    required: false,
    type: 'integer',
    default_value: 20,
  },
  channel: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'email', display_name: 'Email' },
      { value: 'sms', display_name: 'SMS' },
    ],
  },
  name: {
    type: 'string',
    required: false,
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          default_value: 'created',
          allowed_values: [
            { value: 'created_at', display_name: 'Created' },
            { value: 'updated_at', display_name: 'Updated' },
            { value: 'name', display_name: 'Name' },
            { value: 'id', display_name: 'Id' },
          ],
        },
        direction: {
          type: 'string',
          default_value: 'desc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const listCampaigns = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'list_campaigns',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, channel } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['channel'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    const filterString = buildKlaviyoFilterString(
      {
        'messages.channel': channel,
        ...(obj?.name && { name: obj.name }),
      },
      {
        'messages.channel': 'equals',
        name: 'contains',
      }
    );
    const sort = obj?.sort;
    const pageCursor = obj?.cursor;

    try {
      // @ts-expect-error apis.campaignsApi.getCampaigns does not have a type definition for the parameters
      const response = await apis.campaignsApi.getCampaigns(filterString || '', {
        ...(pageCursor && { pageCursor }),
        ...(sort && { sort: `${sort?.direction === 'desc' ? '-' : ''}${sort?.field}` }),
      });

      return {
        data: response.body.data.map((item) => omit(item, ['relationships', 'links'])),
        next: response.body?.links?.next || null,
      };
    } catch (error) {
      throw new KlaviyoError(`Failed to list campaigns: ${getKlaviyoErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      data: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              id: { type: 'string' },
              attributes: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    status: { type: 'string' },
                    archived: { type: 'boolean' },
                    audiences: {
                      type: {
                        type: 'hash',
                        fields: {
                          included: {
                            type: {
                              type: 'list',
                              element_type: 'string',
                            },
                          },
                          excluded: {
                            type: {
                              type: 'list',
                              element_type: 'string',
                            },
                          },
                        },
                      },
                    },
                    sendOptions: {
                      type: {
                        type: 'hash',
                        fields: {
                          useSmartSending: { type: 'boolean' },
                        },
                      },
                    },
                    trackingOptions: {
                      type: {
                        type: 'hash',
                        fields: {
                          addTrackingParams: { type: 'boolean' },
                          customTrackingParams: {
                            type: {
                              type: 'list',
                              element_type: {
                                type: 'hash',
                                fields: {
                                  type: { type: 'string' },
                                  value: { type: 'string' },
                                  name: { type: 'string' },
                                },
                              },
                            },
                          },
                          isTrackingClicks: { type: 'boolean' },
                          isTrackingOpens: { type: 'boolean' },
                        },
                      },
                    },
                    sendStrategy: {
                      type: {
                        type: 'hash',
                        fields: {
                          method: { type: 'string' },
                          datetime: { type: 'string' },
                          options: {
                            type: {
                              type: 'hash',
                              fields: {
                                sendPastRecipientsImmediately: { type: 'boolean' },
                              },
                            },
                          },
                        },
                      },
                    },
                    createdAt: { type: 'string' },
                    scheduledAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    sendTime: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      next: { type: 'string' },
    },
  },
});

export default listCampaigns;
