import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';
import { getKlaviyoProfileIdAllowedValues } from '../helpers/get-profile-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getKlaviyoProfileIdAllowedValues,
  },
  additionalFields: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: [
      { value: 'subscriptions', display_name: 'Subscriptions' },
      { value: 'predictive_analytics', display_name: 'Predictive Analytics' },
    ],
  },
} satisfies TQoreOptions;

const getProfile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: KLAVIYO_APP_NAME,
  action: 'get_profile',
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

    const additionalFieldsProfile = obj?.additionalFields as
      | ('subscriptions' | 'predictive_analytics')[]
      | undefined;

    try {
      const response = await apis.profilesApi.getProfile(id, {
        ...(additionalFieldsProfile && { additionalFieldsProfile }),
      });

      const data = response.body.data;

      return omit({ ...data, ...data.attributes }, ['relationships', 'links', 'attributes']);
    } catch (error) {
      throw new KlaviyoError(`Failed to get the profile: ${getKlaviyoErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',

    fields: {
      type: { type: 'string' },
      id: { type: 'string' },

      email: { type: 'string' },
      phoneNumber: { type: 'string' },
      externalId: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      organization: { type: 'string' },
      locale: { type: 'string' },
      title: { type: 'string' },
      image: { type: 'string' },
      created: { type: 'string' },
      updated: { type: 'string' },
      lastEventDate: { type: 'string' },
      location: {
        type: {
          type: 'hash',
          fields: {
            address1: { type: 'string' },
            address2: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            latitude: { type: 'string' },
            longitude: { type: 'string' },
            region: { type: 'string' },
            zip: { type: 'string' },
            timezone: { type: 'string' },
            ip: { type: 'string' },
          },
        },
      },
      properties: { type: 'hash' },
      subscriptions: {
        type: {
          type: 'hash',
          fields: {
            email: {
              type: {
                type: 'hash',
                fields: {
                  marketing: {
                    type: {
                      type: 'hash',
                      fields: {
                        canReceiveEmailMarketing: { type: 'bool' },
                        consent: { type: 'string' },
                        consentTimestamp: { type: 'string' },
                        lastUpdated: { type: 'string' },
                        method: { type: 'string' },
                        methodDetail: { type: 'string' },
                        customMethodDetail: { type: 'string' },
                        doubleOptin: { type: 'bool' },
                        suppression: {
                          type: {
                            type: 'list',
                            element_type: {
                              type: 'hash',
                              fields: {
                                reason: { type: 'string' },
                                timestamp: { type: 'string' },
                              },
                            },
                          },
                        },
                        listSuppressions: {
                          type: {
                            type: 'list',
                            element_type: {
                              type: 'hash',
                              fields: {
                                listId: { type: 'string' },
                                reason: { type: 'string' },
                                timestamp: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            sms: {
              type: {
                type: 'hash',
                fields: {
                  marketing: {
                    type: {
                      type: 'hash',
                      fields: {
                        canReceiveSmsMarketing: { type: 'bool' },
                        consent: { type: 'string' },
                        consentTimestamp: { type: 'string' },
                        method: { type: 'string' },
                        methodDetail: { type: 'string' },
                        lastUpdated: { type: 'string' },
                      },
                    },
                  },
                  transactional: {
                    type: {
                      type: 'hash',
                      fields: {
                        canReceiveSmsTransactional: { type: 'bool' },
                        consent: { type: 'string' },
                        consentTimestamp: { type: 'string' },
                        method: { type: 'string' },
                        methodDetail: { type: 'string' },
                        lastUpdated: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            mobilePush: {
              type: {
                type: 'hash',
                fields: {
                  marketing: {
                    type: {
                      type: 'hash',
                      fields: {
                        canReceivePushMarketing: { type: 'bool' },
                        consent: { type: 'string' },
                        consentTimestamp: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      predictiveAnalytics: {
        type: {
          type: 'hash',
          fields: {
            historicClv: { type: 'number' },
            predictedClv: { type: 'number' },
            totalClv: { type: 'number' },
            historicNumberOfOrders: { type: 'number' },
            predictedNumberOfOrders: { type: 'number' },
            averageDaysBetweenOrders: { type: 'number' },
            averageOrderValue: { type: 'number' },
            churnProbability: { type: 'number' },
            expectedDateOfNextOrder: { type: 'string' },
          },
        },
      },
    },
  },
});

export default getProfile;
