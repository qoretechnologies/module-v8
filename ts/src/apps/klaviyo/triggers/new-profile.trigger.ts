import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { KLAVIYO_APP_NAME, KlaviyoError } from '../constants';
import { getKlaviyoApis, getKlaviyoErrorMessage } from '../helpers/constants';

const KlaviyoNewProfileTrigger = QoreAppCreator.createLocalizedTrigger({
  app: KLAVIYO_APP_NAME,
  action: 'new_profile',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: KlaviyoError,
    });

    const getItems = () => {
      return fetchLatestEvents({ token });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'klaviyo_new_profile',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: KlaviyoError,
    });

    const profiles = await fetchLatestEvents({ token });

    return profiles?.length > 0 ? profiles[0] : null;
  },
  event_info: {
    desc: 'Klaviyo New Profile Trigger Event Info',
    type: {
      type: 'hash',

      fields: {
        type: { type: 'string' },
        id: { type: 'string' },
        attributes: {
          type: {
            type: 'hash',
            fields: {
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
                                canReceiveEmailMarketing: { type: 'boolean' },
                                consent: { type: 'string' },
                                consentTimestamp: { type: 'string' },
                                lastUpdated: { type: 'string' },
                                method: { type: 'string' },
                                methodDetail: { type: 'string' },
                                customMethodDetail: { type: 'string' },
                                doubleOptin: { type: 'boolean' },
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
                                canReceiveSmsMarketing: { type: 'boolean' },
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
                                canReceiveSmsTransactional: { type: 'boolean' },
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
                                canReceivePushMarketing: { type: 'boolean' },
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
        },
      },
    },
  },
});

export default KlaviyoNewProfileTrigger;

const fetchLatestEvents = async (options: { token: string }) => {
  const { token } = options;

  try {
    const { profilesApi } = getKlaviyoApis(token);

    const response = await profilesApi.getProfiles({
      sort: '-created',
    });

    return response.body.data.map((item) => {
      return omit(item, ['relationships', 'links']);
    });
  } catch (error) {
    throw new KlaviyoError(`Failed to fetch latest profiles: ${getKlaviyoErrorMessage(error)}`);
  }
};
