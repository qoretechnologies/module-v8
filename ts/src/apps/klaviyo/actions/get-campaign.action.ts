import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';
import { getKlaviyoCampaignIdAllowedValues } from '../helpers/get-campaign-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoCampaignIdAllowedValues,
  },
} satisfies TQoreOptions;

const getCampaign = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'get_campaign',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['id'],
      ErrorClass: KlaviyoError,
    });

    const apis = getKlaviyoApis(token);

    try {
      const response = await apis.campaignsApi.getCampaign(id);

      return omit(response.body.data, ['relationships', 'links']);
    } catch (error) {
      throw new KlaviyoError(`Failed to get campaign: ${getKlaviyoErrorMessage(error)}`);
    }
  },
  response_type: {
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
});

export default getCampaign;
